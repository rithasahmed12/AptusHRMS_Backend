// leave-type.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateLeaveDto, LeaveRequestDto } from '../dto/create.dto';
import { UpdateLeaveDto } from '../dto/edit.dto';
import Leave, { LeaveSchema } from '../schemas/leave.schema';
import { TenantService } from 'src/tenant/tenant.service';
import { UserSchema } from '../schemas/user.schema';
import LeaveRequest, { LeaveRequestSchema } from '../schemas/leaveApplication.schema';


@Injectable()
export class LeaveService {
  constructor(private readonly tenantService:TenantService) {}

  private async getLeaveModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.Leave || tenantDb.model('Leave', LeaveSchema);
  }

  private async getUserModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.User || tenantDb.model('User', UserSchema);
  }

  private async getLeaveRequestModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.LeaveRequest || tenantDb.model('LeaveRequest', LeaveRequestSchema);
  }



  async getAllLeaveTypes(tenantId: string, domain: string): Promise<typeof Leave[]> {
    const leaveModel = await this.getLeaveModel(tenantId, domain);
    return leaveModel.find().sort({updatedAt:-1}).exec();
  }

  async createLeaveType(tenantId: string, domain: string, createLeaveTypeDto: CreateLeaveDto): Promise<typeof Leave> {
    const leaveModel = await this.getLeaveModel(tenantId, domain);
    const newLeaveType = new leaveModel({
      ...createLeaveTypeDto,
    });
    return newLeaveType.save();
  }

  async updateLeaveType(tenantId: string, domain: string, id: string, updateLeaveTypeDto: UpdateLeaveDto): Promise<typeof Leave> {
    const leaveModel = await this.getLeaveModel(tenantId, domain);
    return leaveModel.findOneAndUpdate(
      { _id: id },
      updateLeaveTypeDto,
      { new: true }
    ).exec();
  }

  async deleteLeaveType(tenantId: string, domain: string, id: string): Promise<typeof Leave> {
    const leaveModel = await this.getLeaveModel(tenantId, domain);
    return leaveModel.findOneAndDelete({ _id: id }).exec();
  }

  async getAllLeaveRequests(tenantId: string, domain: string): Promise<typeof LeaveRequest[]> {
    const leaveRequestModel = await this.getLeaveRequestModel(tenantId, domain);
    const userModel = await this.getUserModel(tenantId, domain);
    const leaveTypeModel = await this.getLeaveModel(tenantId, domain);

    return leaveRequestModel
      .find({})
      .populate([
        { path: 'userId', model: userModel },
        { path: 'leaveTypeId', model: leaveTypeModel },
      ])
      .sort({ createdAt: -1 });
  }

  async submitLeaveRequest(tenantId: string, domain: string, leaveRequestDto: LeaveRequestDto): Promise<typeof LeaveRequest> {
    console.log('ivde:',leaveRequestDto);
    
    const leaveRequestModel = await this.getLeaveRequestModel(tenantId, domain);
    
    const isOtherLeaveType = leaveRequestDto.leaveTypeId.toLowerCase() === 'other';

    leaveRequestDto.leaveTypeId = isOtherLeaveType ?  null : leaveRequestDto.leaveTypeId
    
    console.log('ivde da');
    const newLeaveRequest = new leaveRequestModel({
        ...leaveRequestDto,
        status: isOtherLeaveType ? 'Pending' : 'Approved',
    });
    
    console.log('ella evde');
    const savedLeaveRequest = await newLeaveRequest.save();
    
    console.log('ivde ibne');
    if (!isOtherLeaveType) {
      await this.updateEmployeeLeaveDays(tenantId, domain, leaveRequestDto.userId, leaveRequestDto.numberOfDays);
    }

    return savedLeaveRequest;
  }

  async updateLeaveRequestStatus(tenantId: string, domain: string, requestId: string, status: string): Promise<typeof LeaveRequest> {
    const leaveRequestModel = await this.getLeaveRequestModel(tenantId, domain);
    const leaveRequest = await leaveRequestModel.findById(requestId);

    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }

    leaveRequest.status = status;
    const updatedLeaveRequest = await leaveRequest.save();

    if (status === 'Approved') {
      await this.updateEmployeeLeaveDays(tenantId, domain, leaveRequest.userId, leaveRequest.numberOfDays);
    }

    return updatedLeaveRequest;
  }

  async getEmployeeLeaveDays(tenantId: string, domain: string, employeeId: string): Promise<{ [key: string]: number }> {
    const userModel = await this.getUserModel(tenantId, domain);
    const leaveRequestModel = await this.getLeaveRequestModel(tenantId, domain);

    const user = await userModel.findById(employeeId);
    if (!user) {
      throw new Error('Employee not found');
    }

    const approvedLeaveRequests = await leaveRequestModel.find({
      userId: employeeId,
      status: 'Approved',
    }).populate('leaveTypeId');

    const leaveDaysSummary = {};
    approvedLeaveRequests.forEach((request) => {
      const leaveTypeName = request.leaveTypeId.name;
      if (!leaveDaysSummary[leaveTypeName]) {
        leaveDaysSummary[leaveTypeName] = 0;
      }
      leaveDaysSummary[leaveTypeName] += request.numberOfDays;
    });

    return leaveDaysSummary;
  }

  private async updateEmployeeLeaveDays(tenantId: string, domain: string, employeeId: string, numberOfDays: number): Promise<void> {
    const userModel = await this.getUserModel(tenantId, domain);
    const user = await userModel.findById(employeeId);

    if (!user) {
      throw new Error('Employee not found');
    }

    user.totalLeaveDays = (user.totalLeaveDays || 0) + numberOfDays;
    await user.save();
  }
}