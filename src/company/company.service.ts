import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from '../tenant/tenant.service';
import { UserSchema } from './schemas/user.schema';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CompanyService {
  constructor(
    private jwtService: JwtService,
    private readonly tenantService: TenantService) {}

  async login(tenantId: string, domain: string, body:{email:string,password:string}, response:Response): Promise<any> {
    try {

      const {email , password} = body;

      const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
      
      const userModel = tenantDb.models.User || tenantDb.model('User', UserSchema);
        
      const user = await userModel.findOne({ email }).exec();
      if (!user || user.password !== password) { 
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { username: email };
      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      });

      response.cookie('companyJwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return { message: 'Login successfull', email:body.email };
    } catch (error) {
        if (error instanceof UnauthorizedException) {
            throw error; 
          }
          console.log(error);
          
      throw new UnauthorizedException("Login Failed!",error);
    }
  }
}
