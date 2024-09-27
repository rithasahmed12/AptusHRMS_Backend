import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AdminLoginDto } from './dto/adminlogin.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import  { Model } from 'mongoose';
import { Order } from '../stripe/schemas/order.schema';
import { Plans } from './schema/plans.schema';
import { CreatePlansDto } from './dto/createPlans.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { TenantService } from 'src/tenant/tenant.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Plans.name) private plansModel: Model<Plans>,
    private readonly mailerService: MailerService,
    private readonly tenantsService: TenantService,
  ) {}

  async validateAdmin(adminLoginDto: AdminLoginDto) {
    const { email, password } = adminLoginDto;

    if (email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASS) {
      return adminLoginDto;
    }
    return null;
  }

  async adminLogin(adminLoginDto: AdminLoginDto, response: Response) {
    const payload = { username: adminLoginDto.email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });

    response.cookie('adminJwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      email: payload.username,
      accessToken: token,
    };
  }

   createTenantId(companyName:string){
    return `${companyName.toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`
  }

  async approveRequest(id: string) {
    const order = await this.orderModel.findById(id);
  
    if (!order) {
      throw new NotFoundException('Order not found');
    }
  
    const tenantId = this.createTenantId(order.company_name);
    const plainTextPassword = order.password;
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
  
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      id,
      { 
        is_approved: true, 
        service_status: 'Approved',
        password: hashedPassword  // Store the hashed password
      },
      { new: true },
    );
  
    // Create tenant after approving the order
    await this.createTenantForOrder(updatedOrder, tenantId, hashedPassword);
  
    // Send approval email with plain text password
    await this.sentApprovalMail(updatedOrder, tenantId);
  }

  private async createTenantForOrder(order: Order, tenantId: string, hashedPassword: string) {
    const tenantData = {
      domain: order.company_name,
      tenantId: tenantId,
    };
  
    const userData = {
      email: order.email,
      password: hashedPassword  // Use the hashed password
    }
  
    try {
      await this.tenantsService.createTenant(tenantData, userData);
      console.log(`Tenant database created for order ${order._id}`);
    } catch (error) {
      console.error(`Failed to create tenant database for order ${order._id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create tenant database');
    }
  }

  async sentApprovalMail(user: Order, tenantId: string) {
    const domain = user.company_name.replace(/\s/g, '_');
  
    const baseUrl = process.env.NODE_ENV === 'development'
      ? `http://${domain}.${process.env.FRONTEND_URL}`
      : `https://${domain}.shoetopia.site`;
  
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Your HRMS Service Request Has Been Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <header style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #734c4c;">HRMS Service Activated</h1>
          </header>
          <main>
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${user.username},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              We are pleased to inform you that your HRMS service has been successfully activated. Thank you for choosing our Professional plan.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Here are the details of your HRMS service:
            </p>
            <p style="font-size: 16px; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #734c4c;">Company Name:</span> ${user.company_name}
            </p>
            <p style="font-size: 16px; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #734c4c;">Plan:</span> ${user.plan}
            </p>
            <p style="font-size: 16px; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #734c4c;">Order Number:</span> ${user.order_no}
            </p>
            <p style="font-size: 16px; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #734c4c;">Order Date:</span> ${new Date(user.order_date).toLocaleDateString()}
            </p>
            <p style="font-size: 16px; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #734c4c;">Expiry Date:</span> ${new Date(user.expiry_date).toLocaleDateString()}
            </p>
            <p style="font-size: 16px; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #734c4c;">Portal ID:</span> ${tenantId}
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              <span style="font-weight: bold; color: #734c4c;">Your HRMS Portal:</span> 
              <a href="${baseUrl}" style="color: #734c4c; text-decoration: underline;">${baseUrl}</a>
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              To access your HRMS portal, please use the login credentials you provided during the purchase process.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">Best regards,</p>
            <p style="font-size: 16px; font-weight: bold;">The Shoetopia HRMS Team</p>
          </main>
          <footer style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px; text-align: center;">
            <p style="font-size: 14px; color: #999;">For support, please contact our team at support@shoetopia.com</p>
            <p style="font-size: 14px; color: #999;">&copy; 2024 Shoetopia HRMS. All rights reserved.</p>
          </footer>
        </div>
      `,
    });
  } 

  async getCustomers() {
    return this.orderModel.find({ service_status: 'Approved' }).sort({ updatedAt: -1 }).exec();
  }

  async unblockCustomers(id: string) {
    const updatedCustomer = await this.orderModel.findByIdAndUpdate(
      id,
      { is_blocked: false },
      { new: true },
    );

    if (!updatedCustomer) {
      throw new NotFoundException('Customer not found');
    }
  }

  async blockCustomers(id: string) {
    const updatedCustomer = await this.orderModel.findByIdAndUpdate(
      id,
      { is_blocked: true },
      { new: true },
    );

    if (!updatedCustomer) {
      throw new NotFoundException('Customer not found');
    }
  }

  async getPlans() {
    return this.plansModel.find().sort({ updatedAt: -1 }).exec();
  }

  async createPlans(createPlansDto: CreatePlansDto) {
    const plan = createPlansDto;

    const existingPlan = await this.plansModel.findOne({ plan_name: plan.planName });

    if (existingPlan) {
      return { success: false, message: 'Plan already exists!' };
    }

    await this.plansModel.create({
      plan_name: plan.planName,
      plan_price: plan.planAmount,
      duration: plan.planDuration,
      max_employees: plan.maxEmployees,
    });
    return { success: true, message: 'Plan created successfully!' };
  }

  async listPlan(id: string) {
    const updatedPlan = await this.plansModel.findByIdAndUpdate(
      id,
      { is_listed: true },
      { new: true },
    );

    if (!updatedPlan) {
      throw new NotFoundException('Plan not found');
    }
  }

  async unlistPlan(id: string) {
    const updatedPlan = await this.plansModel.findByIdAndUpdate(
      id,
      { is_listed: false },
      { new: true },
    );

    if (!updatedPlan) {
      throw new NotFoundException('Plan not found');
    }
  }

  async editPlans(id: string, createPlansDto: CreatePlansDto): Promise<Plans> {
    const existingPlan = await this.plansModel.findById(id);

    if (!existingPlan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    const isDuplicatePlanName = await this.plansModel.findOne({
      plan_name: createPlansDto.planName,
      _id: { $ne: id },
    });

    if (isDuplicatePlanName) {
      throw new ConflictException(`Plan name ${createPlansDto.planName} already exists`);
    }

    existingPlan.plan_name = createPlansDto.planName;
    existingPlan.plan_price = Number(createPlansDto.planAmount);
    existingPlan.duration = Number(createPlansDto.planDuration);
    existingPlan.max_employees = Number(createPlansDto.maxEmployees);

    return existingPlan.save();
  }
}
