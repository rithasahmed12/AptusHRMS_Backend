import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { DesignationService } from '../services/designation.service';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { EditDesignationDto } from '../dto/edit.dto';
import { CreateDesignationDto } from '../dto/create.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorators';

@Controller('designation')
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin')
  @Post()
  createDesignation(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() createDesignationDto: CreateDesignationDto,
  ) {
    return this.designationService.createDesignation(
      tenantInfo.tenantId,
      tenantInfo.domain,
      createDesignationDto,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get()
  getDesignations(@TenantInfo() tenantInfo: TenantInfoInterface) {
    return this.designationService.getDesignations(
      tenantInfo.tenantId,
      tenantInfo.domain,
    );
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin')
  @Put(':id')
  editDesignation(
    @Param('id') id: string,
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() editDesignationDto: EditDesignationDto,
  ) {
    return this.designationService.editDesignation(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id,
      editDesignationDto,
    );
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin')
  @Delete(':id')
  deleteDesignation(
    @Param('id') id: string,
    @TenantInfo() tenantInfo: TenantInfoInterface,
  ) {
    return this.designationService.deleteDesignation(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id,
    );
  }
}
