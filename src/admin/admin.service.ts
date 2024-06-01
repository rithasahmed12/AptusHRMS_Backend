import { Injectable } from '@nestjs/common';
import { AdminLoginDto } from './dto/adminlogin.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AdminService {
    constructor(private jwtService: JwtService){}

    async adminLogin(adminLoginDto:AdminLoginDto){
        const {email,password} = adminLoginDto;
        const payload = {
            email : email
        }
        return {
            ...adminLoginDto,
            accessToken:this.jwtService.sign(payload)
        }
    }
}
