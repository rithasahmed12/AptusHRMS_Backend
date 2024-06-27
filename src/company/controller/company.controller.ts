import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { Request, Response, response } from 'express';
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
    @Req() req: Request,
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const domain = req.headers['x-domain'] as string;

    if (!tenantId || !domain) {
      throw new UnauthorizedException('No Header Token available');
    }

    return this.companyService.login(tenantId, domain, body, response);
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
