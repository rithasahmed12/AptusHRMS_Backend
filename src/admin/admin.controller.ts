import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/adminlogin.dto';
import { AdminAuthGuard } from './guards/local-auth.guard';
import { JwtGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService) {}

    @UseGuards(AdminAuthGuard)
    @Post('login')
    async adminLogin(
        @Body() adminLoginDto: AdminLoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        return await this.adminService.adminLogin(adminLoginDto, response);
    }


    @UseGuards(JwtGuard)
    @Get('requests')
    async getRequests(@Req() request:Request) {
        console.log(request.cookies)
        return { message: 'Authorized request' };
    }
}
