import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminLoginDto } from './dto/adminlogin.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AdminService {
    constructor(private jwtService: JwtService) {}

    async validateAdmin(adminLoginDto: AdminLoginDto) {
        const { email, password } = adminLoginDto;
    
        if (email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASS) {
            return adminLoginDto;
        }
        return null;
    }
    
    async adminLogin(adminLoginDto: AdminLoginDto, response: Response) {
        const payload = { username: adminLoginDto.email };
        const token = this.jwtService.sign(payload,{secret:process.env.JWT_SECRET,expiresIn:'1d'});

        // Set the JWT token in a cookie
        response.cookie('adminJwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
        });

        return {
            email: payload.username,
            accessToken: token,
        };
    }
}
