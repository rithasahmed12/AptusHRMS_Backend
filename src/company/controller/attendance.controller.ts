// controllers/attendance.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { AttendanceService } from '../services/attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(CompanyAuthGuard)
  @Post('check-in')
  async checkIn(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body('employeeId') employeeId: string,
  ) {
    return this.attendanceService.checkIn(
      tenantInfo.tenantId,
      tenantInfo.domain,
      employeeId,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Post('check-out')
  async checkOut(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body('employeeId') employeeId: string,
  ) {
    return this.attendanceService.checkOut(
      tenantInfo.tenantId,
      tenantInfo.domain,
      employeeId,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get('employee/:id')
  async getEmployeeAttendance(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') employeeId: string,
  ) {
    return this.attendanceService.getEmployeeAttendance(
      tenantInfo.tenantId,
      tenantInfo.domain,
      employeeId,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get('/current-day/:id')
  async getCurrentDayEmployeeAttendance(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') employeeId: string,
  ) {
    return this.attendanceService.getCurrentDayEmployeeAttendance(
      tenantInfo.tenantId,
      tenantInfo.domain,
      employeeId,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get('today')
  async getTodayAttendance(@TenantInfo() tenantInfo: TenantInfoInterface) {
    return this.attendanceService.getTodayAttendance(
      tenantInfo.tenantId,
      tenantInfo.domain,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get('status/:id')
  async getAttendanceStatus(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') employeeId: string,
  ) {
    return this.attendanceService.getAttendanceStatus(
      tenantInfo.tenantId,
      tenantInfo.domain,
      employeeId,
    );
  }
}
