import { Body, Controller, Get, Param, Patch, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/adminlogin.dto';
import { AdminAuthGuard } from './guards/local-auth.guard';
import { JwtGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { CreatePlansDto } from './dto/createPlans.dto';

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
    async getRequests() {
        return this.adminService.getRequests();
    }

    @UseGuards(JwtGuard)
    @Patch('approveRequest/:id')
    async approveRequest(@Param('id') id: string) {
      return this.adminService.approveRequest(id);
    }

    @UseGuards(JwtGuard)
    @Patch('declineRequest/:id')
    async declineRequest(@Param('id') id: string,@Body('reason') reason: string) {
      return this.adminService.declineRequest(id,reason);
    }

    @UseGuards(JwtGuard)
    @Get('customers')
    async getCustomers(){
        return this.adminService.getCustomers();
    }

    @UseGuards(JwtGuard)
    @Patch('unblockCustomer/:id')
    async unblockCustomers(@Param('id') id: string) {
      return this.adminService.unblockCustomers(id);
    }

    @UseGuards(JwtGuard)
    @Patch('blockCustomer/:id')
    async blockCustomers(@Param('id') id: string) {
      return this.adminService.blockCustomers(id);
    }

    @UseGuards(JwtGuard)
    @Get('plan')
    async getPlans(){
        return this.adminService.getPlans();
    }

    @UseGuards(JwtGuard)
    @Post('createPlan')
    async createPlans(@Body() createPlansDto:CreatePlansDto){
        return this.adminService.createPlans(createPlansDto);
    }

    @UseGuards(JwtGuard)
    @Put('editPlan/:id')
    async editPlans(@Param('id') id:string,@Body() createPlansDto:CreatePlansDto){
        return this.adminService.editPlans(id,createPlansDto);
    }

    @UseGuards(JwtGuard)
    @Patch('listPlan/:id')
    async listPlan(@Param('id') id: string) {
      return this.adminService.listPlan(id);
    }

    @UseGuards(JwtGuard)
    @Patch('unlistPlan/:id')
    async unlistPlan(@Param('id') id: string) {
      return this.adminService.unlistPlan(id);
    }

    
}
