// services/work-shift.service.ts
import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import { WorkShiftSchema } from '../schemas/workshift.schema';
import { CreateWorkShiftDto } from '../dto/create.dto';
import { EditWorkShiftDto } from '../dto/edit.dto';

@Injectable()
export class WorkShiftService {
  constructor(private readonly tenantService: TenantService) {}

  private async getWorkShiftModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.WorkShift || tenantDb.model('WorkShift', WorkShiftSchema);
  }

  async createWorkShift(tenantId: string, domain: string, createWorkShiftDto: CreateWorkShiftDto) {
    const workShiftModel = await this.getWorkShiftModel(tenantId, domain);
    const workShift = await workShiftModel.create(createWorkShiftDto);
    return { message: 'Work shift created successfully!', workShift };
  }

  async getWorkShifts(tenantId: string, domain: string) {
    const workShiftModel = await this.getWorkShiftModel(tenantId, domain);
    return await workShiftModel.find().sort({ createdAt: -1 });
  }

  async getWorkShift(tenantId: string, domain: string,id:string) {
    const workShiftModel = await this.getWorkShiftModel(tenantId, domain);
    return await workShiftModel.findById(id).sort({ createdAt: -1 });
  }

  async editWorkShift(
    tenantId: string,
    domain: string,
    id: string,
    editWorkShiftDto: EditWorkShiftDto,
  ) {
    const workShiftModel = await this.getWorkShiftModel(tenantId, domain);
    return await workShiftModel.findByIdAndUpdate(
      { _id: id },
      editWorkShiftDto,
      { new: true },
    );
  }

  async deleteWorkShift(tenantId: string, domain: string, id: string) {
    const workShiftModel = await this.getWorkShiftModel(tenantId, domain);
    await workShiftModel.findByIdAndDelete({ _id: id });
    return { message: "Work shift deleted successfully!" };
  }
}