import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from '../tenant/tenant.service';
import { UserSchema } from './schemas/user.schema';

@Injectable()
export class CompanyService {
  constructor(private readonly tenantService: TenantService) {}

  async login(tenantId: string, domain: string, email: string, password: string): Promise<any> {
    try {
      const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
      const userModel = tenantDb.model('User', UserSchema); 
        
      const user = await userModel.findOne({ email }).exec();
      if (!user || user.password !== password) { 
        throw new UnauthorizedException('Invalid credentials');
      }

      return { message: 'Login successfull' };
    } catch (error) {
        if (error instanceof UnauthorizedException) {
            throw error;  // Rethrow the original UnauthorizedException
          }
      throw new UnauthorizedException('Login failed');
    }
  }
}
