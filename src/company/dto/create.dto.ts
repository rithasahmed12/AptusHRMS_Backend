import { IsDate, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

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

  @IsEmail()
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
  readonly shift?: string;

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

