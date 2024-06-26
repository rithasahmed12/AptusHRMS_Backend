// project.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create.dto';
import { UpdateProjectDto } from '../dto/edit.dto';
import { ProjectService } from '../services/projects.service';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  
  @UseGuards(CompanyAuthGuard)
  @Post()
  createProject(@TenantInfo() tenantInfo: TenantInfoInterface,@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(tenantInfo.tenantId,tenantInfo.domain,createProjectDto);
  }

  @UseGuards(CompanyAuthGuard)
  @Get()
  findAllProjects(@TenantInfo() tenantInfo: TenantInfoInterface,) {
    return this.projectService.findAllProjects(tenantInfo.tenantId,tenantInfo.domain,);
  }

  @UseGuards(CompanyAuthGuard)
  @Get(':id')
  findOneProject(@TenantInfo() tenantInfo: TenantInfoInterface,@Param('id') id: string) {
    return this.projectService.findOneProject(tenantInfo.tenantId,tenantInfo.domain,id);
  }

  @UseGuards(CompanyAuthGuard)
  @Patch(':id')
  updateProject(@TenantInfo() tenantInfo: TenantInfoInterface,@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.updateProject(tenantInfo.tenantId,tenantInfo.domain,id, updateProjectDto);
  }

  @UseGuards(CompanyAuthGuard)
  @Delete(':id')
  removeProject(@TenantInfo() tenantInfo: TenantInfoInterface,@Param('id') id: string) {
    return this.projectService.removeProject(tenantInfo.tenantId,tenantInfo.domain,id);
  }
}