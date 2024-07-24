// payroll.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { PayrollService } from '../services/payroll.service';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantService } from 'src/tenant/tenant.service';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';

@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly tenantService: TenantService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3PM)
  async handleDailyPayroll() {
    const tenants = await this.tenantService.getAllTenants();
    const today = new Date();

    console.log('tenants:',tenants);
    

    for (const tenant of tenants) {
      await this.payrollService.calculateDailyPayroll(
        tenant.tenantId,
        tenant.domain,
        today
      );
    }
  }

  @UseGuards(CompanyAuthGuard)
  @Get('attendance')
  getAttendance(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('employeeId') employeeId: string
  ) {
    console.log('Year:',year);
    console.log('month:',month);
    console.log('employeeId:',employeeId);
    
    return this.payrollService.getAttendanceData(tenantInfo.tenantId, tenantInfo.domain, parseInt(year), parseInt(month), employeeId);
  }
}