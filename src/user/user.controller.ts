import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService:UserService){}

    @Post('otp')
    sentOtp(@Body() body:{email:string} ){
        return this.userService.sendOTP(body)
    }

    @Post('verifyOtp')
    verifyOtp(@Body() body:{otp:number,email:string}){
        return this.userService.verifyOtp(body)
    }

    @Get('plan')
    async getPlans(){
        return this.userService.getPlans();
    }  
}
