import { IsDate, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsBoolean, IsOptional, IsString, IsArray, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';

export class AnnouncementDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  details: string;

  @IsNotEmpty()
  @IsString()
  author: string;
}

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  head: string;
}

export class CreateDesignationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  departmentId: string;
}

export class CreateEmployeeDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly gender?: string;

  @IsOptional()
  readonly dob?: Date;

  @IsOptional()
  @IsString()
  readonly streetAddress?: string;

  @IsOptional()
  @IsString()
  readonly city?: string;

  @IsOptional()
  @IsString()
  readonly country?: string;

  @IsOptional()
  @IsString()
  readonly postalCode?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  allowances: { name: string; amount: number }[];

  // @IsEmail()
  readonly email: string;

  @IsOptional()
  readonly hireDate?: Date;

  @IsOptional()
  readonly joiningDate?: Date;


  @IsOptional()
  @IsString()
  readonly employeeType?: string;

  @IsOptional()
  @IsString()
  readonly departmentId?: string;

  @IsOptional()
  @IsString()
  readonly designationId?: string;

  @IsOptional()
  @IsString()
  readonly employeeId?: string;

  @IsOptional()
  @IsString()
  readonly status?: string;

  @IsString()
  readonly role: string;

  @IsOptional()
  @IsString()
  readonly workShift?: string;

  @IsOptional()
  readonly profilePic?: any;
}


export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(['Low', 'Medium', 'High'])
  priority: string;

  startDate: Date;

  endDate: Date;

  @IsOptional()
  @IsString()
  assignedPerson: string|null;
}

export class UpsertCompanyDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  linkedinHandle?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

}

export class CreateWorkShiftDto {
  shiftName: string;
  workingDays: string[];
  shiftIn: string;
  shiftOut: string;
  lateThreshold?: number;
  halfdayThreshold?: number;
  shiftOutNextDay?: boolean;
}

export class CreateHolidayDto {
  name: string;
  startDate: string;
  endDate: string;
}

export class CreateLeaveDto {
  name: string;
  numberOfDays: number;
  status: 'Active' | 'Inactive';
}

export class CreateAssetDto {
  name: string;
  type: string;
  status: 'In Use' | 'Available' | 'Maintenance';
  assignedTo?: string;
  image?: string;
}



export class LeaveRequestDto {
  @IsString()
  userId: string;

  @IsString()
  leaveTypeId: string;


  startDate: Date|string;

  endDate: Date|string;

  @IsString()
  reason: string;
  
  numberOfDays:number;

  @IsEnum(['Pending', 'Approved', 'Rejected'])
  @IsOptional()
  status?: 'Pending' | 'Approved' | 'Rejected';

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;
}

class DynamicFieldDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsBoolean()
  required: boolean;

  @IsArray()
  @IsString({ each: true })
  fileTypes: string[];
}

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @IsEnum(['Open', 'Closed'])
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DynamicFieldDto)
  dynamicFields: DynamicFieldDto[];
}


export class ChangePasswordDto {
  currentPassword:string;
  newPassword:string;
  confirmPassword:string
}


