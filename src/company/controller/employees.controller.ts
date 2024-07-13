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
import { diskStorage } from 'multer';
  
  @Controller('employee')
  export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}
  
    @UseGuards(CompanyAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async createEmployee(
      @TenantInfo() tenantInfo: TenantInfoInterface,
      @Body() createUserDto: CreateEmployeeDto,
      @UploadedFile() file: Express.Multer.File
    ) {
      console.log('Received DTO:', createUserDto);
      console.log('Received file:', file);
    
      return await this.employeeService.createEmployee(
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
    @Post(':id/allowance')
    addAllowance(
      @Param('id') id: string,
      @TenantInfo() tenantInfo: TenantInfoInterface,
      @Body() allowance: { name: string; amount: number }
    ) {
      return this.employeeService.addAllowance(
        tenantInfo.tenantId,
        tenantInfo.domain,
        id,
        allowance
      );
    }
  
    @UseGuards(CompanyAuthGuard)
    @Put(':id/allowance/:index')
    editAllowance(
      @Param('id') id: string,
      @Param('index') index: number,
      @TenantInfo() tenantInfo: TenantInfoInterface,
      @Body() allowance: { name: string; amount: number }
    ) {
      return this.employeeService.editAllowance(
        tenantInfo.tenantId,
        tenantInfo.domain,
        id,
        index,
        allowance
      );
    }
  
    @UseGuards(CompanyAuthGuard)
    @Delete(':id/allowance/:index')
    removeAllowance(
      @Param('id') id: string,
      @Param('index') index: number,
      @TenantInfo() tenantInfo: TenantInfoInterface
    ) {
      return this.employeeService.removeAllowance(
        tenantInfo.tenantId,
        tenantInfo.domain,
        id,
        index
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
    @UseInterceptors(FileInterceptor('file'))
    @Put(':id')
    editEmployee(
      @Param('id') id: string,
      @TenantInfo() tenantInfo: TenantInfoInterface,
      @Body() editUserDto: EditEmployeeDto,
      @UploadedFile() file: Express.Multer.File
    ) {
      return this.employeeService.editEmployee(
        tenantInfo.tenantId,
        tenantInfo.domain,
        id,
        editUserDto,
        file
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
  