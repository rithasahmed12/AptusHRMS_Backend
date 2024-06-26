import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import { DepartmentSchema } from '../schemas/department.schema';
import { EditDepartmentDto } from '../dto/edit.dto';
import { CreateDepartmentDto } from '../dto/create.dto';


@Injectable()
export class DepartmentService {

    constructor(private readonly tenantService:TenantService){}
    
    private async getDeparmentModel(tenantId: string, domain: string) {
        const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
        return tenantDb.models.Department || tenantDb.model('Department', DepartmentSchema);
      }

    async createDepartment(tenantId:string,domain:string,createDepartmentDto:CreateDepartmentDto){
        const departmentModel = await this.getDeparmentModel(tenantId,domain);
        const department = await departmentModel.create(createDepartmentDto);
        return { message: 'Department created successfully!', department }; 
    }
    
    async getDepartment(tenantId: string, domain: string) {
        const deparmtentModel = await this.getDeparmentModel(tenantId, domain);
        return await deparmtentModel.find().sort({ createdAt: -1 });
      }
   
      async editDepartment(
        tenantId: string,
        domain: string,
        id: string,
        editDepartmentDto: EditDepartmentDto,
      ) {
        const departmentModel = await this.getDeparmentModel(tenantId, domain);
        return await departmentModel.findByIdAndUpdate(
          { _id: id },
          { name: editDepartmentDto.name, head: editDepartmentDto.head},
          { new: true },
        );
      }
    
      async deleteDepartment(tenantId: string, domain: string, id: string) {
        const departmentModel = await this.getDeparmentModel(tenantId, domain);
        await departmentModel.findByIdAndDelete({ _id: id });
        return { message: "Department Deleted successfully!" };
      }  
}
