// holiday.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { HolidayService } from '../services/holiday.service';
import { CreateHolidayDto } from '../dto/create.dto';
import { UpdateHolidayDto } from '../dto/edit.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorators';

@Controller('holiday')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @UseGuards(CompanyAuthGuard)
  @Get()
  getAllHolidays(@TenantInfo() tenantInfo: TenantInfoInterface) {
    return this.holidayService.getAllHolidays(tenantInfo.tenantId, tenantInfo.domain);
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin','hr')
  @Post()
  createHoliday(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() createHolidayDto: CreateHolidayDto
  ) {
    return this.holidayService.createHoliday(tenantInfo.tenantId, tenantInfo.domain, createHolidayDto);
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin','hr')
  @Put(':id')
  updateHoliday(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
    @Body() updateHolidayDto: UpdateHolidayDto
  ) {
    return this.holidayService.updateHoliday(tenantInfo.tenantId, tenantInfo.domain, id, updateHolidayDto);
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin','hr')
  @Delete(':id')
  deleteHoliday(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string
  ) {
    return this.holidayService.deleteHoliday(tenantInfo.tenantId, tenantInfo.domain, id);
  }
}