import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { Project,ProjectDocument, ProjectSchema } from '../schemas/project.schema';
import { CreateProjectDto } from '../dto/create.dto';
import { UpdateProjectDto } from '../dto/edit.dto';
import { TenantService } from 'src/tenant/tenant.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly tenantService: TenantService
) {}

  private async getProjectModel(tenantId: string, domain: string,) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.Project || tenantDb.model('Project', ProjectSchema);
  }

  async createProject(tenantId: string, domain: string,createProjectDto: CreateProjectDto): Promise<Project> {
    const projectModel = await this.getProjectModel(tenantId,domain)
    const createdProject = new projectModel(createProjectDto);
    return createdProject.save();
  }

  async findAllProjects(tenantId: string, domain: string): Promise<Project[]> {
    const projectModel = await this.getProjectModel(tenantId,domain)
    return projectModel.find().populate('assignedPerson').exec();
  }

  async findOneProject(tenantId: string, domain: string,id: string): Promise<Project> {
    const projectModel = await this.getProjectModel(tenantId,domain)
    const project = await projectModel.findById(id).populate('assignedPerson').exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return project;
  }

  async updateProject(tenantId: string, domain: string,id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const projectModel = await this.getProjectModel(tenantId,domain)
    const updatedProject = await projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .populate('assignedPerson')
      .exec();
    if (!updatedProject) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return updatedProject;
  }

  async removeProject(tenantId: string, domain: string,id: string): Promise<Project> {
    const projectModel = await this.getProjectModel(tenantId,domain)
    const deletedProject = await projectModel.findByIdAndDelete(id).exec();
    if (!deletedProject) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return deletedProject;
  }
}