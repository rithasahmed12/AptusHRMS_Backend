import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import User, { UserSchema } from '../schemas/user.schema';
import Department from '../schemas/department.schema';
import Designation from '../schemas/designation.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ChangePasswordDto, CreateEmployeeDto } from '../dto/create.dto';
import { EditEmployeeDto } from '../dto/edit.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {v2 as cloudinary} from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import WorkShift, { WorkShiftSchema } from '../schemas/workshift.schema';

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
  
    // Parse the allowances if they exist
    let parsedAllowances = [];
    if (createUserDto.allowances && typeof createUserDto.allowances === 'string') {
      try {
        parsedAllowances = JSON.parse(createUserDto.allowances);
      } catch (error) {
        console.error('Error parsing allowances:', error);
      }
    }
  
    const userWithPassword = { 
      ...createUserDto, 
      password: hashedPassword,
      profilePic: profilePicUrl,
      allowances: parsedAllowances
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
    const workshiftModel = tenantDb.model('WorkShift',WorkShift.schema);

    return await userModel
      .find({ role: { $ne: 'admin' } })
      .populate([
        { path: 'designationId', model: designationModel },
        { path: 'departmentId', model: departmentModel },
        { path: 'workShift', model: workshiftModel },
      ])
      .sort({ createdAt: -1 });
  }

  async getEmployee(tenantId: string, domain: string,id:string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId,domain); 
    const userModel = tenantDb.model('User', User.schema);
    const departmentModel = tenantDb.model('Department', Department.schema);
    const designationModel = tenantDb.model('Designation', Designation.schema);
    const workshiftModel = tenantDb.model('WorkShift',WorkShift.schema);

    return await userModel
      .findOne({_id:id})
      .populate([
        { path: 'designationId', model: designationModel },
        { path: 'departmentId', model: departmentModel },
        { path: 'workShift', model: workshiftModel },
      ])
      .sort({ createdAt: -1 });
  }

  async editEmployee(
    tenantId: string,
    domain: string,
    id: string,
    editUserDto: EditEmployeeDto,
    file?: Express.Multer.File
  ) {
    const userModel = await this.getUserModel(tenantId, domain);
    console.log('EmployeeData:', editUserDto);
    console.log('File:', file);
  
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
  
    let profilePicUrl = existingUser.profilePic;
  
    if (file) {
      // Delete the existing image from Cloudinary if it exists
      if (existingUser.profilePic) {
        await this.deleteFromCloudinary(existingUser.profilePic);
      }
  
      profilePicUrl = await this.uploadToCloudinary(file);
    }
  
    // Parse the allowances if they exist
    let parsedAllowances = existingUser.allowances;
    if (editUserDto.allowances && typeof editUserDto.allowances === 'string') {
      try {
        parsedAllowances = JSON.parse(editUserDto.allowances);
      } catch (error) {
        console.error('Error parsing allowances:', error);
      }
    }
  
    const updatedUserData = {
      ...editUserDto,
      profilePic: profilePicUrl,
      allowances: parsedAllowances
    };
  
    const updatedUser = await userModel.findByIdAndUpdate(id, updatedUserData, { new: true });
  
    return { message: 'Employee updated successfully!', user: updatedUser };
  }
  
  async deleteEmployee(tenantId: string, domain: string, id: string) {
    const userModel = await this.getUserModel(tenantId, domain);
    
    const user = await userModel.findById(id);
    
    if (!user) {
      throw new NotFoundException('Employee not found');
    }
    if (user.profilePic) {
      try {
        await this.deleteFromCloudinary(user.profilePic);
      } catch (error) {
        console.error('Error deleting profile picture from Cloudinary:', error);
      }
    }
    await userModel.findByIdAndDelete(id);
  
    return { message: 'Employee deleted successfully' };
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'employee_profiles' }, 
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
  
      upload.end(file.buffer);
    });
  }

  private async deleteFromCloudinary(imageUrl: string) {
    console.log('imageUrl:', imageUrl);
    
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    const publicId = filename.split('.')[0];
    
    console.log('publicId:', publicId);
    
    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(`employee_profiles/${publicId}`);
        console.log('Cloudinary delete result:', result);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    } else {
      console.log('No valid public_id found in profileImage URL');
    }
  }

  private async sendWelcomeEmail(
    user: any,
    tenantId: string,
    domain: string,
    password: string,
  ) {
    const baseUrl = process.env.NODE_ENV === 'development'
  ? `http://${domain}.${process.env.FRONTEND_URL}`
  : `https://${domain}.shoetopia.site`

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
            <a href="${baseUrl}" style="color: #734c4c; text-decoration: underline;">${baseUrl}</a>
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

  // New methods for handling allowances
  async addAllowance(tenantId: string, domain: string, employeeId: string, allowance: { name: string; amount: number }) {
    const userModel = await this.getUserModel(tenantId, domain);
    const user = await userModel.findById(employeeId);
    if (!user) {
      throw new NotFoundException('Employee not found');
    }
    user.allowances.push(allowance);
    await user.save();
    return user;
  }

  async editAllowance(tenantId: string, domain: string, employeeId: string, allowanceIndex: number, updatedAllowance: { name: string; amount: number }) {
    const userModel = await this.getUserModel(tenantId, domain);
    const user = await userModel.findById(employeeId);
    if (!user) {
      throw new NotFoundException('Employee not found');
    }
    if (allowanceIndex < 0 || allowanceIndex >= user.allowances.length) {
      throw new NotFoundException('Allowance not found');
    }
    user.allowances[allowanceIndex] = updatedAllowance;
    await user.save();
    return user;
  }

  async removeAllowance(tenantId: string, domain: string, employeeId: string, allowanceIndex: number) {
    const userModel = await this.getUserModel(tenantId, domain);
    const user = await userModel.findById(employeeId);
    if (!user) {
      throw new NotFoundException('Employee not found');
    }
    if (allowanceIndex < 0 || allowanceIndex >= user.allowances.length) {
      throw new NotFoundException('Allowance not found');
    }
    user.allowances.splice(allowanceIndex, 1);
    await user.save();
    return user;
  }

  async changeEmployeePassword(
    tenantId: string,
    domain: string,
    employeeId: string,
    changePasswordDto: ChangePasswordDto
  ) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const UserModel = await this.getUserModel(tenantId, domain);
    const employee = await UserModel.findById(employeeId);

    if (!employee) {
      throw new UnauthorizedException('Employee not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, employee.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    employee.password = hashedNewPassword;
    await employee.save();

    return { message: 'Password changed successfully' };
  }
}
