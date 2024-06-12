import { Controller, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('verify-tenant')
  async verifyTenant(@Req() req: Request){
    console.log('hjsddsjdhsjdhsj');
    
    return req.headers['x-tenant-id'] as string
  }

  @Post('login')
  async login(@Req() req: Request, @Body() body: { email: string; password: string }) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const domain = req.headers['x-domain'] as string;

    if (!tenantId || !domain) {
      throw new UnauthorizedException('Tenant ID and domain are required');
    }

    return this.companyService.login(tenantId, domain, body.email, body.password);
  }
}
