// leave-type.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateLeaveDto } from '../dto/create.dto';
import { UpdateLeaveDto } from '../dto/edit.dto';
import Leave, { LeaveSchema } from '../schemas/leave.schema';
import { TenantService } from 'src/tenant/tenant.service';


@Injectable()
export class LeaveService {
  constructor(private readonly tenantService:TenantService) {}

  private async getLeaveModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.Leave || tenantDb.model('Leave', LeaveSchema);
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
}