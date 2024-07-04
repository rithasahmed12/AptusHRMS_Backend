import { IsOptional, IsString } from "class-validator";
import { AnnouncementDto, CreateDepartmentDto, CreateDesignationDto, CreateEmployeeDto, CreateProjectDto } from "./create.dto";

export class EditAnnouncementDto extends AnnouncementDto {}

export class EditDepartmentDto extends CreateDepartmentDto {}

export class EditDesignationDto extends CreateDesignationDto {}

export class EditEmployeeDto extends CreateEmployeeDto {
    @IsOptional()
    @IsString()
    role:string
}

export class UpdateProjectDto extends CreateProjectDto {}