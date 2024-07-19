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
  Delete,
  Put,
} from '@nestjs/common';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { AnyFilesInterceptor, FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateJobDto } from '../dto/create.dto';
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
  @UseInterceptors(AnyFilesInterceptor())
  async createApplication(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() createApplicationDto: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    console.log('files:', files);
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

  @UseGuards(CompanyAuthGuard)
  @Put('applicants/:id/status')
  updateApplicationStatus(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.jobService.updateApplicationStatus(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id,
      status,
    );
  }

  @UseGuards(CompanyAuthGuard)
@Put(':id')
updateJob(
  @TenantInfo() tenantInfo: TenantInfoInterface,
  @Param('id') id: string,
  @Body() updateJobDto: CreateJobDto,
) {
  return this.jobService.updateJob(
    tenantInfo.tenantId,
    tenantInfo.domain,
    id,
    updateJobDto,
  );
}


  @UseGuards(CompanyAuthGuard)
  @Get('candidates/shortlisted')
  getShortlistedCandidates(
    @TenantInfo() tenantInfo: TenantInfoInterface,
  ) {
    return this.jobService.getShortlistedCandidates(
      tenantInfo.tenantId,
      tenantInfo.domain,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Delete('applicants/:id')
  deleteApplication(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
  ) {
    return this.jobService.deleteApplication(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id,
    );
  }

  @UseGuards(CompanyAuthGuard)
@Delete(':id')
deleteJob(
  @TenantInfo() tenantInfo: TenantInfoInterface,
  @Param('id') id: string,
) {
  return this.jobService.deleteJob(
    tenantInfo.tenantId,
    tenantInfo.domain,
    id,
  );
}
}
