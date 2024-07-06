import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { LeaveService } from '../services/leave.service';
import { CreateLeaveDto, LeaveRequestDto } from '../dto/create.dto';
import { UpdateLeaveDto } from '../dto/edit.dto';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveTypeService: LeaveService) {}

  @UseGuards(CompanyAuthGuard)
  @Get()
  getAllLeaveTypes(@TenantInfo() tenantInfo: TenantInfoInterface) {
    return this.leaveTypeService.getAllLeaveTypes(tenantInfo.tenantId, tenantInfo.domain);
  }

  @UseGuards(CompanyAuthGuard)
  @Post()
  createLeaveType(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() createLeaveTypeDto: CreateLeaveDto
  ) {
    return this.leaveTypeService.createLeaveType(tenantInfo.tenantId, tenantInfo.domain, createLeaveTypeDto);
  }

  @UseGuards(CompanyAuthGuard)
  @Put(':id')
  updateLeaveType(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
    @Body() updateLeaveTypeDto: UpdateLeaveDto
  ) {
    return this.leaveTypeService.updateLeaveType(tenantInfo.tenantId, tenantInfo.domain, id, updateLeaveTypeDto);
  }

  @UseGuards(CompanyAuthGuard)
  @Delete(':id')
  deleteLeaveType(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string
  ) {
    return this.leaveTypeService.deleteLeaveType(tenantInfo.tenantId, tenantInfo.domain, id);
  }

  @UseGuards(CompanyAuthGuard)
  @Get('request')
  async getAllLeaveRequests(@TenantInfo() tenantInfo: TenantInfoInterface) {
    return this.leaveTypeService.getAllLeaveRequests(tenantInfo.tenantId, tenantInfo.domain);
  }

  @UseGuards(CompanyAuthGuard)
  @Post('request')
  async submitLeaveRequest(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() leaveRequestDto: LeaveRequestDto,
  ) {
    return this.leaveTypeService.submitLeaveRequest(tenantInfo.tenantId, tenantInfo.domain, leaveRequestDto);
  }

  @UseGuards(CompanyAuthGuard)
  @Put('request/:id/status')
  async updateLeaveRequestStatus(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.leaveTypeService.updateLeaveRequestStatus(tenantInfo.tenantId, tenantInfo.domain, id, status);
  }

  @UseGuards(CompanyAuthGuard)
  @Get('employee/:id/days')
  async getEmployeeLeaveDays(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') employeeId: string,
  ) {
    return this.leaveTypeService.getEmployeeLeaveDays(tenantInfo.tenantId, tenantInfo.domain, employeeId);
  }
}