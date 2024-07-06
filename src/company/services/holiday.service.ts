// holiday.service.ts
import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import { HolidaySchema } from '../schemas/holiday.schema';
import { CreateHolidayDto } from '../dto/create.dto';
import { UpdateHolidayDto } from '../dto/edit.dto';


@Injectable()
export class HolidayService {
  constructor(private readonly tenantService: TenantService) {}

  private async getHolidayModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.Holiday || tenantDb.model('Holiday', HolidaySchema);
  }

  async getAllHolidays(tenantId: string, domain: string) {
    const holidayModel = await this.getHolidayModel(tenantId, domain);
    return holidayModel.find().sort({ startDate: 1 });
  }

  async createHoliday(tenantId: string, domain: string, createHolidayDto: CreateHolidayDto) {
    const holidayModel = await this.getHolidayModel(tenantId, domain);
    const holiday = new holidayModel(createHolidayDto);
    return holiday.save();
  }

  async updateHoliday(tenantId: string, domain: string, id: string, updateHolidayDto: UpdateHolidayDto) {
    const holidayModel = await this.getHolidayModel(tenantId, domain);
    return holidayModel.findByIdAndUpdate(id, updateHolidayDto, { new: true });
  }

  async deleteHoliday(tenantId: string, domain: string, id: string) {
    const holidayModel = await this.getHolidayModel(tenantId, domain);
    return holidayModel.findByIdAndDelete(id);
  }
}