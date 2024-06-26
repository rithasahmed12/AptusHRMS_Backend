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
  @IsNumber()
  readonly basicSalary?: number;

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
  @IsString()
  readonly profilePic?: string;
}


export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(['Not Started', 'In Progress', 'Completed'])
  status: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsEnum(['Low', 'Medium', 'High'])
  priority: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsMongoId()
  assignedPerson: string;
}

