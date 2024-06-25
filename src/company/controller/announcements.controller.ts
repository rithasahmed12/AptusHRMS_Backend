import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Put, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { AnnouncementsService } from '../services/announcements.service';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { TenantInfo } from '../decorators/tenantInfo.decorator';
import { TenantInfoInterface } from '../interface/tenantInfo.interface';
import { AnnouncementDto } from '../dto/create.dto';
import { EditAnnouncementDto } from '../dto/edit.dto';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @UseGuards(CompanyAuthGuard)
  @Post()
  createAnnouncements(
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() announcementDto: AnnouncementDto,
  ) {
    return this.announcementsService.createAnnouncements(
      tenantInfo.tenantId,
      tenantInfo.domain,
      announcementDto,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get()
  getAnnouncements(@TenantInfo() tenantInfo: TenantInfoInterface) {
    return this.announcementsService.getAnnouncements(tenantInfo.tenantId, tenantInfo.domain);
  }

  @UseGuards(CompanyAuthGuard)
  @Patch('read/:id')
  markRead(
    @Param('id') id: string,
    @TenantInfo() tenantInfo: TenantInfoInterface,
  ) {
    return this.announcementsService.markRead(tenantInfo.tenantId, tenantInfo.domain, id);
  }

  @UseGuards(CompanyAuthGuard)
  @Put(':id')
  editAnnouncement(
    @Param('id') id: string,
    @TenantInfo() tenantInfo: TenantInfoInterface,
    @Body() editAnnouncementDto: EditAnnouncementDto,
  ) {
    return this.announcementsService.editAnnouncement(
      tenantInfo.tenantId,
      tenantInfo.domain,
      id,
      editAnnouncementDto,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Delete(':id')
  deleteAnnouncement(
    @Param('id') id: string,
    @TenantInfo() tenantInfo: TenantInfoInterface,
  ) {
    return this.announcementsService.deleteAnnouncement(tenantInfo.tenantId, tenantInfo.domain, id);
  }
}
