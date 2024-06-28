import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Put,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
  } from '@nestjs/common';
  import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
  import { TenantInfo } from '../decorators/tenantInfo.decorator';
  import { TenantInfoInterface } from '../interface/tenantInfo.interface';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { CreateEmployeeDto } from '../dto/create.dto';
  import { EditEmployeeDto } from '../dto/edit.dto';
import { EmployeeService } from '../services/employees.service';
  
  @Controller('employee')
  export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}
  
    @UseGuards(CompanyAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('profilePic'))
    createEmployee(
      @TenantInfo() tenantInfo: TenantInfoInterface,
      @Body() createUserDto: CreateEmployeeDto,
      @UploadedFile() file: Express.Multer.File
    ) {
      return this.employeeService.createEmployee(
        tenantInfo.tenantId,
        tenantInfo.domain,
        createUserDto,
        file
      );
    }
  
    @UseGuards(CompanyAuthGuard)
    @Get()
    getEmployees(@TenantInfo() tenantInfo: TenantInfoInterface) {
      return this.employeeService.getEmployees(
        tenantInfo.tenantId,
        tenantInfo.domain,
      );
    }

    @UseGuards(CompanyAuthGuard)
    @Get(':id')
    getEmployee(@TenantInfo() tenantInfo: TenantInfoInterface,@Param('id') id:string) {
      return this.employeeService.getEmployee(
        tenantInfo.tenantId,
        tenantInfo.domain,
        id
      );
    }
  
    @UseGuards(CompanyAuthGuard)
    @Put(':id')
    editEmployee(
      @Param('id') id: string,
      @TenantInfo() tenantInfo: TenantInfoInterface,
      @Body() editUserDto: EditEmployeeDto,
    ) {
      return this.employeeService.editEmployee(
        tenantInfo.tenantId,
        tenantInfo.domain,
        id,
        editUserDto,
      );
    }
  
    @UseGuards(CompanyAuthGuard)
    @Delete(':id')
    deleteEmployee(
      @Param('id') id: string,
      @TenantInfo() tenantInfo: TenantInfoInterface,
    ) {
      return this.employeeService.deleteEmployee(
        tenantInfo.tenantId,
        tenantInfo.domain,
        id,
      );
    }
  }
  