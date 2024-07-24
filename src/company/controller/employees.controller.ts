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
    Patch,
  } from '@nestjs/common';
  import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
  import { TenantInfo } from '../decorators/tenantInfo.decorator';
  import { TenantInfoInterface } from '../interface/tenantInfo.interface';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ChangePasswordDto, CreateEmployeeDto } from '../dto/create.dto';
  import { EditEmployeeDto } from '../dto/edit.dto';
import { EmployeeService } from '../services/employees.service';
import { diskStorage } from 'multer';
import { Roles } from '../decorators/roles.decorators';
import { RolesGuard } from '../guards/roles.guard';
import { imageFileFilter } from '../utility/fileFilter.utility';
  
  @Controller('employee')
  export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}
  
    @UseGuards(CompanyAuthGuard, RolesGuard)
    @Roles('admin', 'hr')
    @Post()
    @UseInterceptors(FileInterceptor('file', {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024 
      }
    }))
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
    @Get(':id')
    getEmployee(@TenantInfo() tenantInfo: TenantInfoInterface,@Param('id') id:string) {
      return this.employeeService.getEmployee(
        tenantInfo.tenantId,
        tenantInfo.domain,
        id
      );
    }

    @UseGuards(CompanyAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024 
      }
    }))
    @Put('profile/:id')
    editEmployeeProfile(
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
  
    @UseGuards(CompanyAuthGuard,RolesGuard)
    @Roles('admin','hr')
    @UseInterceptors(FileInterceptor('file', {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024 
      }
    }))
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
  
    @UseGuards(CompanyAuthGuard,RolesGuard)
    @Roles('admin','hr')
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

    @UseGuards(CompanyAuthGuard)
    @Patch('change-password/:id')
    changeEmployeePassword(
      @Param('id') id: string,
      @TenantInfo() tenantInfo: TenantInfoInterface,
      @Body() changePasswordDto:ChangePasswordDto
    ){
      return this.employeeService.changeEmployeePassword(
        tenantInfo.tenantId,
        tenantInfo.domain,
        id,
        changePasswordDto
      )
    }


  }
  