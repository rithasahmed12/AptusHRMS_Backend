import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard extends AuthGuard('adminJwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies.adminJwt;
   
    // console.log('token:', token);
    
    if (!token) {
      return false;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { username: string };;
      console.log('decoded:',decoded);
      
      const adminEmail = process.env.ADMIN_EMAIL;

      if (!adminEmail) {
        throw new Error('Admin email not found in environment variables');
      }

      if(decoded.username !== adminEmail){
        throw new UnauthorizedException('Incorrect Payload');
      }

      request.adminEmail = adminEmail;

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
