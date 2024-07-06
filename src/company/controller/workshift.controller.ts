// controllers/work-shift.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { WorkShiftService } from '../services/workshift.service';
import { CreateWorkShiftDto } from '../dto/create.dto';
import { EditWorkShiftDto } from '../dto/edit.dto';

@Controller('workshift')
export class WorkShiftController {
  constructor(private readonly workShiftService: WorkShiftService) {}

  @UseGuards(CompanyAuthGuard)
  @Post()
  createWorkShift(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() createWorkShiftDto: CreateWorkShiftDto,
  ) {
    return this.workShiftService.createWorkShift(
      tenantInfo.tenantId,
      tenantInfo.domain,
      createWorkShiftDto,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get()
  getWorkShifts(@TenantInfo() tenantInfo: TenantInfoInterface) {
    return this.workShiftService.getWorkShifts(
      tenantInfo.tenantId,
      tenantInfo.domain,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get(':id')
  getWorkShift(@TenantInfo() tenantInfo: TenantInfoInterface,@Param('id') id:string) {
    return this.workShiftService.getWorkShift(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Put(':id')
  editWorkShift(
    @Param('id') id: string,
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() editWorkShiftDto: EditWorkShiftDto,
  ) {
    return this.workShiftService.editWorkShift(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id,
      editWorkShiftDto,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Delete(':id')
  deleteWorkShift(
    @Param('id') id: string,
    @TenantInfo() tenantInfo: TenantInfoInterface,
  ) {
    return this.workShiftService.deleteWorkShift(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id,
    );
  }
}
