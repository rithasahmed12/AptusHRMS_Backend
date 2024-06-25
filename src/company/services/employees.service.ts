import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import User from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateEmployeeDto } from '../dto/create.dto';
import { EditEmployeeDto } from '../dto/edit.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly mailerService: MailerService,
  ) {}

  async createEmployee(
    tenantId: string,
    domain: string,
    createUserDto: CreateEmployeeDto,
  ) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const userModel = tenantDb.model('User', User.schema);
    
    // Generate random password
    const password = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    const userWithPassword = { ...createUserDto, password: hashedPassword };

    const user = await userModel.create(userWithPassword);

    // Send email to the newly created employee
    await this.sendWelcomeEmail(user, tenantId, domain, password);

    return { message: 'Employee created successfully!', user, password };
  }

  async getEmployees(tenantId: string, domain: string) {
    console.log('iVDE');
    
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    console.log(';ivde ethi');
    
    const userModel = tenantDb.model('User', User.schema);
    return await userModel
      .find({ role: { $ne: 'admin' } })
      .populate('designationId departmentId')
      .sort({ createdAt: -1 });
  }

  async editEmployee(
    tenantId: string,
    domain: string,
    id: string,
    editUserDto: EditEmployeeDto,
  ) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const userModel = tenantDb.model('User', User.schema);
    return await userModel.findByIdAndUpdate(id, editUserDto, { new: true });
  }

  async deleteEmployee(tenantId: string, domain: string, id: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const userModel = tenantDb.model('User', User.schema);
    await userModel.findByIdAndDelete(id);
    return { message: 'Employee deleted successfully!' };
  }

  private async sendWelcomeEmail(user: any, tenantId: string, domain: string, password: string) {
    const frontendUrl = `http://${domain}.localhost:5173`;
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