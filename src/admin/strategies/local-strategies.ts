import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminService } from '../admin.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private adminService: AdminService) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string): Promise<any> {
        const adminLoginDto = { email, password };
        const user = await this.adminService.validateAdmin(adminLoginDto);
       
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }
}
