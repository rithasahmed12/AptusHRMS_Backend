import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService:UserService){}

    @Post('otp')
    register(@Body() body:{email:string} ){
        return this.userService.sendOTP(body)
    }
}
