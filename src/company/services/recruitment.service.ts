// job.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateApplicationDto, CreateJobDto } from '../dto/create.dto';
import Application, { ApplicationSchema } from '../schemas/application.schema';
import Job, { JobSchema } from '../schemas/job.schema';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class JobService {
  constructor(
    private readonly tenantService: TenantService,
  ) {}

  private async getJobModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.Job || tenantDb.model('Job', JobSchema);
  }

  private async getApplicationModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.Application || tenantDb.model('Application', ApplicationSchema);
  }

  async createJob(tenantId: string, domain: string, createJobDto: CreateJobDto) {
    const jobModel = await this.getJobModel(tenantId, domain);
    const job = new jobModel(createJobDto);
    return job.save();
  }

  async getJobs(tenantId: string, domain: string) {
    const jobModel = await this.getJobModel(tenantId, domain);
    return await jobModel.find().sort({ createdAt: -1 });
  }

  async getJob(tenantId: string, domain: string, id: string) {
    const jobModel = await this.getJobModel(tenantId, domain);
    const job = await jobModel.findById(id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async createApplication(
    tenantId: string,
    domain: string,
    createApplicationDto: CreateApplicationDto,
    files: { [fieldname: string]: Express.Multer.File[] }
  ) {
    const applicationModel = await this.getApplicationModel(tenantId, domain);
    
    console.log('CreateApplicationDto:', createApplicationDto);
    
    const { jobId, ...applicantDetails } = createApplicationDto;
  
    const applicationData: any = {
      jobId,
      applicantDetails
    };
  
    if (files) {
      applicationData.uploadedFiles = {};
      for (const [fieldname, fileArray] of Object.entries(files)) {
        applicationData.uploadedFiles[fieldname] = await Promise.all(
          fileArray.map(async (file) => {
            try {
              const cloudinaryUrl = await this.uploadToCloudinary(file);
              return {
                cloudinaryUrl,
                name: file.originalname,
                type: file.mimetype,
                size: file.size
              };
            } catch (error) {
              console.error(`Error uploading ${fieldname} to Cloudinary:`, error);
              return null;
            }
          })
        );
        // Remove null entries (failed uploads)
        applicationData.uploadedFiles[fieldname] = applicationData.uploadedFiles[fieldname].filter(Boolean);
      }
    }
  
    const application = await applicationModel.create(applicationData);
  
    return application;
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { 
          folder: 'employee_profiles',
          resource_type: 'auto' // This allows Cloudinary to automatically detect the file type
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );

      upload.end(file.buffer);
    });
  }
  
  async getJobApplications(tenantId: string, domain: string) {
    console.log("ivde ind");
    
    const applicationModel = await this.getApplicationModel(tenantId, domain);
    console.log("ivdem ind tto");
    return await applicationModel.find().sort({ submittedAt: -1 });
  }

  async getApplication(tenantId: string, domain: string, id: string) {
    const applicationModel = await this.getApplicationModel(tenantId, domain);
    const application = await applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }
}