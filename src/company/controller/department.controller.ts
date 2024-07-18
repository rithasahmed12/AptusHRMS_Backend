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
import { DepartmentService } from '../services/department.service';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { EditDepartmentDto } from '../dto/edit.dto';
import { CreateDepartmentDto } from '../dto/create.dto';
import { Roles } from '../decorators/roles.decorators';
import { RolesGuard } from '../guards/roles.guard';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin')
  @Post()
  createDepartment(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() createCompanyDto: CreateDepartmentDto,
  ) {
    console.log('reached here:', createCompanyDto);

    return this.departmentService.createDepartment(
      tenantInfo.tenantId,
      tenantInfo.domain,
      createCompanyDto,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get()
  getDepartments(@TenantInfo() tenantInfo: TenantInfoInterface) {
    return this.departmentService.getDepartment(
      tenantInfo.tenantId,
      tenantInfo.domain,
    );
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin')
  @Put(':id')
  editDepartment(
    @Param('id') id: string,
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() editDepartmentDto: EditDepartmentDto,
  ) {
    return this.departmentService.editDepartment(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id,
      editDepartmentDto,
    );
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin')
  @Delete(':id')
  deleteDepartment(
    @Param('id') id: string,
    @TenantInfo() tenantInfo: TenantInfoInterface,
  ) {
    return this.departmentService.deleteDepartment(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id,
    );
  }
}
