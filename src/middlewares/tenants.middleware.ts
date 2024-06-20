import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from 'src/tenant/tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    console.log('req.headers:',req.headers);
    
    const tenantId = req.headers['x-tenant-id'];
    const companyName = req.headers['x-domain'];

    if (!tenantId || !companyName) {
      throw new UnauthorizedException('Tenant ID and domain are required');
    }

    try {
      const tenantDb = await this.tenantService.getTenantDatabase(tenantId as string, companyName as string);
      req['tenantDb'] = tenantDb;
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid tenant credentials');
    }
  }
}
