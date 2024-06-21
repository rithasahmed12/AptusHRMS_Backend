import { Controller, Post, Body, Req, UseGuards, UnauthorizedException, Res } from '@nestjs/common';
import { Request, Response, response } from 'express';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('verify-tenant')
  async verifyTenant(@Req() req: Request){  
    return req.headers['x-tenant-id'] as string
  }

  @Post('login')
  async login(@Req() req: Request, @Body() body: { email: string; password: string },@Res({ passthrough: true }) response:Response) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const domain = req.headers['x-domain'] as string;
    

    if (!tenantId || !domain) {
      throw new UnauthorizedException('Tenant ID and domain are required');
    }

    return this.companyService.login(tenantId, domain, body, response);
  }
}
