import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import User, { UserSchema } from '../schemas/user.schema';
import Department from '../schemas/department.schema';
import Designation from '../schemas/designation.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateEmployeeDto } from '../dto/create.dto';
import { EditEmployeeDto } from '../dto/edit.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {v2 as cloudinary} from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly mailerService: MailerService,
    private configService: ConfigService,
  ) {
    const cloudinaryConfig = this.configService.get('cloudinary');
    cloudinary.config(cloudinaryConfig);
  }

  private async getUserModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.User || tenantDb.model('User', UserSchema);
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'employee_profiles' }, // You can specify a folder in your Cloudinary account
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
  
      upload.end(file.buffer);
    });
  }

 

  async createEmployee(
    tenantId: string,
    domain: string,
    createUserDto: CreateEmployeeDto,
    file?: Express.Multer.File
  ) {
    const userModel = await this.getUserModel(tenantId, domain);
    console.log('EmployeeData:', createUserDto);
    console.log('File:', file);

    const password = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let profilePicUrl: string | undefined;

    if (file) {
      profilePicUrl = await this.uploadToCloudinary(file);
    }

    const userWithPassword = { 
      ...createUserDto, 
      password: hashedPassword,
      profilePic: profilePicUrl
    };

    const user = await userModel.create(userWithPassword);

    await this.sendWelcomeEmail(user, tenantId, domain, password);

    return { message: 'Employee created successfully!', user };
  }

  async getEmployees(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId,domain);
    const userModel = tenantDb.model('User', User.schema);
    const departmentModel = tenantDb.model('Department', Department.schema);
    const designationModel = tenantDb.model('Designation', Designation.schema);

    return await userModel
      .find({ role: { $ne: 'admin' } })
      .populate([
        { path: 'designationId', model: designationModel },
        { path: 'departmentId', model: departmentModel },
      ])
      .sort({ createdAt: -1 });
  }

  async getEmployee(tenantId: string, domain: string,id:string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId,domain);
    const userModel = tenantDb.model('User', User.schema);
    const departmentModel = tenantDb.model('Department', Department.schema);
    const designationModel = tenantDb.model('Designation', Designation.schema);

    return await userModel
      .findOne({_id:id,role: { $ne: 'admin' } })
      .populate([
        { path: 'designationId', model: designationModel },
        { path: 'departmentId', model: departmentModel },
      ])
      .sort({ createdAt: -1 });
  }

  async editEmployee(tenantId: string,domain: string,id: string,editUserDto: EditEmployeeDto) {
    const userModel = await this.getUserModel(tenantId,domain);
    return await userModel.findByIdAndUpdate(id, editUserDto, { new: true });
  }
  
  async deleteEmployee(tenantId: string, domain: string, id: string) {
    const userModel = await this.getUserModel(tenantId,domain);
    await userModel.findByIdAndDelete(id);
  }

  private async sendWelcomeEmail(
    user: any,
    tenantId: string,
    domain: string,
    password: string,
  ) {
    const frontendUrl = `http://${domain}.localhost:3000`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Our Company',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <header style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #734c4c;">Welcome to Our Company</h1>
          </header>
          <main>
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${user.name || 'Employee'},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              We are excited to have you on board. Below are your account details:
            </p>
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #734c4c;">Portal URL:</p>
            <a href="${frontendUrl}" style="color: #734c4c; text-decoration: underline;">${frontendUrl}</a>
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #734c4c;">Portal ID: ${tenantId}</p>
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #734c4c;">Email: ${user.email}</p>
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #734c4c;">Password: ${password}</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Please use these credentials to access your account.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">Regards,</p>
            <p style="font-size: 16px; font-weight: bold;">Your Company</p>
          </main>
          <footer style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px; text-align: center;">
            <p style="font-size: 14px; color: #999;">If you have any questions, please contact our support team.</p>
            <p style="font-size: 14px; color: #999;">&copy; 2024 Your Company. All rights reserved.</p>
          </footer>
        </div>
      `,
    });
  }
}
