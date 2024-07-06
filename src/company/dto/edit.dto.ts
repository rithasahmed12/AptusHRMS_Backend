import { IsOptional, IsString } from 'class-validator';
import {
  AnnouncementDto,
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateEmployeeDto,
  CreateProjectDto,
} from './create.dto';

export class EditAnnouncementDto extends AnnouncementDto {}

export class EditDepartmentDto extends CreateDepartmentDto {}

export class EditDesignationDto extends CreateDesignationDto {}

export class EditEmployeeDto extends CreateEmployeeDto {
  @IsOptional()
  @IsString()
  role: string;
}

export class UpdateProjectDto extends CreateProjectDto {}

export class EditWorkShiftDto {
  shiftName?: string;
  workingDays?: string[];
  shiftIn?: string;
  shiftOut?: string;
  lateThreshold?: number;
  halfdayThreshold?: number;
  shiftOutNextDay?: boolean;
}

export class UpdateHolidayDto {
  name?: string;
  startDate?: string;
  endDate?: string;
}

export class UpdateLeaveDto {
  name?: string;
  numberOfDays?: number;
  status?: 'Active' | 'Inactive';
}

export class UpdateAssetDto {
    name?: string;
    type?: string;
    status?: 'In Use' | 'Available' | 'Maintenance';
    assignedTo?: string;
    image?: string;
}
