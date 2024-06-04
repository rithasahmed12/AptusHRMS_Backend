import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AdminLoginDto } from './dto/adminlogin.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../stripe/schemas/order.schema';
import { Plans } from './schema/plans.schema';
import { CreatePlansDto } from './dto/createPlans.dto';

@Injectable()
export class AdminService {
    constructor(
        private jwtService: JwtService,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Plans.name) private plansModel: Model<Plans>,
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
        const token = this.jwtService.sign(payload,{secret:process.env.JWT_SECRET,expiresIn:'1d'});

        // Set the JWT token in a cookie
        response.cookie('adminJwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite:'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        return {
            email: payload.username,
            accessToken: token,
        };
    }

    async getRequests(){
        const data = this.orderModel.find().sort({updatedAt:-1});
        return data;
    }

    async approveRequest(id:string){
        const updatedOrder = await this.orderModel.findByIdAndUpdate(
            id,
            { is_approved: true , service_status:"Approved" },
            { new: true }
          );
      
          if (!updatedOrder) {
            throw new Error('Order not found');
          }
    }

    async declineRequest(id:string){
        const updatedOrder = await this.orderModel.findByIdAndUpdate(
            id,
            { service_status:"Declined" },
            { new: true }
          );
      
          if (!updatedOrder) {
            throw new Error('Order not found');
          }
    }

    async getCustomers(){
        const customers = await this.orderModel.find({ service_status: 'Approved' }).sort({ updatedAt: -1 });
        return customers;
    }

    async unblockCustomers(id:string){
        const updatedCustomer = await this.orderModel.findByIdAndUpdate(
            id,
            { is_blocked: false },
            { new: true }
          );
      
          if (!updatedCustomer) {
            throw new Error('customer not found');
          }
    }

    async blockCustomers(id:string){
        const updatedCustomer = await this.orderModel.findByIdAndUpdate(
            id,
            { is_blocked: true },
            { new: true }
          );
      
          if (!updatedCustomer) {
            throw new Error('customer not found');
          }
    }

    async getPlans(){
        const plans = await this.plansModel.find().sort({ updatedAt: -1 })
        return plans;
    }

    async createPlans(createPlansDto:CreatePlansDto){
        const plan = createPlansDto;

        const existingPlan = await this.plansModel.findOne({plan_name:plan.planName});
        
        if(existingPlan){
            return {success:false,message:'Plan already exist!'};
        }

         await this.plansModel.create({
            plan_name:plan.planName,
            plan_price:plan.planAmount,
            duration:plan.planDuration,
            max_employees:plan.maxEmployees
        });
        return {success:true,message:'Plan created Successfully!'}   
    }

    async listPlan(id:string){
        const updatedCustomer = await this.plansModel.findByIdAndUpdate(
            id,
            { is_listed: true },
            { new: true }
          );
      
          if (!updatedCustomer) {
            throw new Error('customer not found');
          }
    }

    async unlistPlan(id:string){
        const updatedCustomer = await this.plansModel.findByIdAndUpdate(
            id,
            { is_listed: false },
            { new: true }
          );
      
          if (!updatedCustomer) {
            throw new Error('customer not found');
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
