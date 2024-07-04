import {
  Controller,
  Post,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CompanyService } from '../services/company.service';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

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
}
