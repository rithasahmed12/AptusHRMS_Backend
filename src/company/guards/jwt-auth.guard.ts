import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { UserSchema } from '../schemas/user.schema';
import { TenantService } from 'src/tenant/tenant.service';


@Injectable()
export class CompanyAuthGuard extends AuthGuard('companyJwt') {
  constructor(private readonly tenantService: TenantService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies.companyJwt;
    const tenantId = request.headers['x-tenant-id'];
    const domain = request.headers['x-domain'];

    // console.log('token:', token);

    if (!token || !tenantId || !domain) {
      return false;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { username: string };
      // console.log('decoded', decoded);

     
      const tenantDb = await this.tenantService.getTenantDatabase(tenantId, domain);
      

      const userModel = tenantDb.models.User || tenantDb.model('User', UserSchema);
      const user = await userModel.findOne({ email: decoded.username }).exec();

      // console.log('User:',user);
      

      if (!user) {
        throw new UnauthorizedException('User not found in tenant database');
      }

    
      request.user = user;
      request.tenantDb = tenantDb;

      return true;
    } catch (error) {
      console.error('Authentication error:', error.message);
      throw new UnauthorizedException(error.message);
    }
  }
}