import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import Designation, { DesignationSchema } from '../schemas/designation.schema';
import { CreateDesignationDto } from '../dto/create.dto';
import { EditDesignationDto } from '../dto/edit.dto';

@Injectable()
export class DesignationService {
  constructor(private readonly tenantService: TenantService) {}

  private async getDesignationModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.Designation || tenantDb.model('Designation', DesignationSchema);
  }

  async createDesignation(tenantId: string,domain: string,createDesignationDto: CreateDesignationDto) {
    const designationModel = await this.getDesignationModel(tenantId,domain);
    const designation = await designationModel.create(createDesignationDto);
    return { message: 'Designation created successfully!', designation };
  }

  async getDesignations(tenantId: string, domain: string) {
    const designationModel = await this.getDesignationModel(tenantId,domain);
    return await designationModel.find().sort({ createdAt: -1 });
  }

  async editDesignation(tenantId: string,domain: string,id: string,editDesignationDto: EditDesignationDto) {
    const designationModel = await this.getDesignationModel(tenantId,domain);
    return await designationModel.findByIdAndUpdate(
      id,
      editDesignationDto,
      { new: true },
    );
  }

  async deleteDesignation(tenantId: string, domain: string, id: string) {
    const designationModel = await this.getDesignationModel(tenantId,domain);
    await designationModel.findByIdAndDelete(id);
    return { message: 'Designation deleted successfully!' };
  }
}
