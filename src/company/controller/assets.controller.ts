
// asset.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { AssetService } from '../services/assets.service';
import { CreateAssetDto } from '../dto/create.dto';
import { UpdateAssetDto } from '../dto/edit.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorators';
import { imageFileFilter } from '../utility/fileFilter.utility';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @UseGuards(CompanyAuthGuard)
  @Get()
  getAllAssets(@TenantInfo() tenantInfo: TenantInfoInterface) {
    return this.assetService.getAllAssets(tenantInfo.tenantId, tenantInfo.domain);
  }

  @UseGuards(CompanyAuthGuard)
  @Get('request')
  async getAllAssetRequest(@TenantInfo() tenantInfo:TenantInfoInterface){    
    return this.assetService.getAssetApplication(tenantInfo.tenantId,tenantInfo.domain);
  }


  @UseGuards(CompanyAuthGuard)
  @Get(':id')
  getAsset(@TenantInfo() tenantInfo: TenantInfoInterface,@Param('id') id:string) {
    return this.assetService.getAsset(tenantInfo.tenantId, tenantInfo.domain,id);
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin','hr')
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024 
    }
  }))
  async createAsset(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() createAssetDto: CreateAssetDto,
    @UploadedFile() file: Express.Multer.File
  ) {
  
    return this.assetService.createAsset(tenantInfo.tenantId, tenantInfo.domain, createAssetDto,file);
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin','hr')
  @Put('request/:id/status')
  updateAssetRequestStatus(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
    @Body('status') status: 'Approved' | 'Rejected'
  ) {
    return this.assetService.updateAssetRequestStatus(tenantInfo.tenantId, tenantInfo.domain, id, status);
  }


  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin','hr')
  @UseInterceptors(FileInterceptor('image', {
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024 
    }
  }))
  @Put(':id')
  updateAsset(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.assetService.updateAsset(tenantInfo.tenantId, tenantInfo.domain, id, updateAssetDto,file);
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin','hr')
  @Delete(':id')
  deleteAsset(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string
  ) {
    return this.assetService.deleteAsset(tenantInfo.tenantId, tenantInfo.domain, id);
  }

  @UseGuards(CompanyAuthGuard,RolesGuard)
  @Roles('admin','hr')
  @Put(':id/assign')
  assignAsset(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
    @Body('assignedTo') assignedTo: string
  ) {
    return this.assetService.assignAsset(tenantInfo.tenantId, tenantInfo.domain, id, assignedTo);
  }

  @UseGuards(CompanyAuthGuard)
  @Put(':id/:userId/request')
  requestAsset(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.assetService.requestAsset(tenantInfo.tenantId, tenantInfo.domain, id,userId);
  }


}