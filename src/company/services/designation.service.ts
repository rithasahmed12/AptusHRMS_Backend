import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import Designation from '../schemas/designation.schema';
import { CreateDesignationDto } from '../dto/create.dto';
import { EditDesignationDto } from '../dto/edit.dto';

@Injectable()
export class DesignationService {
  constructor(private readonly tenantService: TenantService) {}

  async createDesignation(
    tenantId: string,
    domain: string,
    createDesignationDto: CreateDesignationDto,
  ) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const designationModel = tenantDb.model('Designation', Designation.schema);
    const designation = await designationModel.create(createDesignationDto);
    return { message: 'Designation created successfully!', designation };
  }

  async getDesignations(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const designationModel = tenantDb.model('Designation', Designation.schema);
    return await designationModel.find().sort({ createdAt: -1 });
  }

  async editDesignation(
    tenantId: string,
    domain: string,
    id: string,
    editDesignationDto: EditDesignationDto,
  ) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const designationModel = tenantDb.model('Designation', Designation.schema);
    return await designationModel.findByIdAndUpdate(
      id,
      editDesignationDto,
      { new: true },
    );
  }

  async deleteDesignation(tenantId: string, domain: string, id: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const designationModel = tenantDb.model('Designation', Designation.schema);
    await designationModel.findByIdAndDelete(id);
    return { message: 'Designation deleted successfully!' };
  }
}
