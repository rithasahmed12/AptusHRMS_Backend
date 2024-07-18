import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CompanyService } from '../services/company.service';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpsertCompanyDto } from '../dto/create.dto';
import { Roles } from '../decorators/roles.decorators';
import { RolesGuard } from '../guards/roles.guard';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async getCompanyInfo(@TenantInfo() tenantInfo:TenantInfoInterface){
    return this.companyService.getCompanyInfo(tenantInfo.tenantId,tenantInfo.domain);
  }

  @Post('verify-tenant')
  async verifyTenant(@Req() req: Request) {
    return req.headers['x-tenant-id'] as string;
  }

  @Post('login')
  async login(
    @TenantInfo() tenantInfo:TenantInfoInterface,
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.companyService.login(tenantInfo.tenantId, tenantInfo.domain, body, response);
  }

  @Post('sent-otp')
  sentOtp(@TenantInfo() tenantInfo:TenantInfoInterface,@Body('email') email:string) {
     return this.companyService.sendOTP(tenantInfo.tenantId,tenantInfo.domain,email)
  }

  @Post('verify-otp')
  async verifyOtp(@TenantInfo() tenantInfo:TenantInfoInterface,@Body() body:{email:string,otpString:string}) {
    return this.companyService.verifyOTP(tenantInfo.tenantId,tenantInfo.domain,body);
  }

  @Post('change-password')
  async changePassword(@TenantInfo() tenantInfo:TenantInfoInterface,@Body() body:{email:string,newPassword:string}){
    return this.companyService.changePassword(tenantInfo.tenantId,tenantInfo.domain,body)
  }

@UseGuards(CompanyAuthGuard,RolesGuard)
@Roles('admin','hr')
@UseInterceptors(FileInterceptor('logo'))
@Post('upsert')
async upsertCompany(
  @TenantInfo() tenantInfo: TenantInfoInterface,
  @Body() companyDto: UpsertCompanyDto,
  @UploadedFile() file: Express.Multer.File
) {
  return this.companyService.upsertCompany(
    tenantInfo.tenantId,
    tenantInfo.domain,
    companyDto,
    file
  );
}
}
