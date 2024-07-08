// job.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateApplicationDto, CreateJobDto } from '../dto/create.dto';
import { JobService } from '../services/recruitment.service';
import path from 'path';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @UseGuards(CompanyAuthGuard)
  @Post()
  async createJob(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() createJobDto: CreateJobDto,
  ) {
    return await this.jobService.createJob(
      tenantInfo.tenantId,
      tenantInfo.domain,
      createJobDto,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get()
  getJobs(@TenantInfo() tenantInfo: TenantInfoInterface) {
    return this.jobService.getJobs(tenantInfo.tenantId, tenantInfo.domain);
  }

  @UseGuards(CompanyAuthGuard)
  @Get('applicants')
  getJobApplications(
    @TenantInfo() tenantInfo: TenantInfoInterface,
  ) {
    return this.jobService.getJobApplications(
      tenantInfo.tenantId,
      tenantInfo.domain
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get(':id')
  getJob(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
  ) {
    return this.jobService.getJob(tenantInfo.tenantId, tenantInfo.domain, id);
  }

  @Post('application')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'Resume', maxCount: 1 },
    { name: 'Images', maxCount: 10 },
    { name: 'Documents', maxCount: 10 },
    // Add more fields as needed
  ]))
  async createApplication(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] }
  ) {
    return this.jobService.createApplication(tenantInfo.tenantId, tenantInfo.domain, createApplicationDto, files);
  }



  @UseGuards(CompanyAuthGuard)
  @Get('applications/:id')
  getApplication(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
  ) {
    return this.jobService.getApplication(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id,
    );
  }
}
