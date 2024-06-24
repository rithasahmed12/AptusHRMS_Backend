import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AnnouncementsService } from '../services/announcements.service';
import { AnnouncementDto } from '../dto/announcement.dto';
import { CompanyAuthGuard } from '../guards/jwt-auth.guard';
import { EditAnnouncementDto } from '../dto/editAnnouncement.dto';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @UseGuards(CompanyAuthGuard)
  @Post()
  createAnnouncements(
    @Headers() headers: any,
    @Body() announcementDto: AnnouncementDto,
  ) {
    const tenantId = headers['x-tenant-id'] as string;
    const domain = headers['x-domain'] as string;

    if (!tenantId || !domain) {
      throw new UnauthorizedException('No Header Token available');
    }

    return this.announcementsService.createAnnouncements(
      tenantId,
      domain,
      announcementDto,
    );
  }

  @UseGuards(CompanyAuthGuard)
  @Get()
  getAnnouncements(
    @Headers() headers: any
  ) {
    const tenantId = headers['x-tenant-id'] as string;
    const domain = headers['x-domain'] as string;

    if (!tenantId || !domain) {
      throw new UnauthorizedException('No Header Token available');
    }

    return this.announcementsService.getAnnouncements(tenantId,domain);
  }

  @UseGuards(CompanyAuthGuard)
  @Patch('read/:id')
  markRead(@Param('id') id:string, @Headers() headers: any,){
    const tenantId = headers['x-tenant-id'] as string;
    const domain = headers['x-domain'] as string;

    if (!tenantId || !domain) {
      throw new UnauthorizedException('No Header Token available');
    }

    return this.announcementsService.markRead(tenantId,domain,id);

  }

  @UseGuards(CompanyAuthGuard)
  @Put(':id')
  editAnnouncement(@Param('id') id:string, @Headers() headers: any,@Body() editAnnouncementDto:EditAnnouncementDto){
    const tenantId = headers['x-tenant-id'] as string;
    const domain = headers['x-domain'] as string;

    if (!tenantId || !domain) {
      throw new UnauthorizedException('No Header Token available');
    }

    return this.announcementsService.editAnnouncement(tenantId,domain,id,editAnnouncementDto);

  }

  @UseGuards(CompanyAuthGuard)
  @Delete(':id')
  deleteAnnouncement(@Param('id') id:string, @Headers() headers: any){
    const tenantId = headers['x-tenant-id'] as string;
    const domain = headers['x-domain'] as string;

    if (!tenantId || !domain) {
      throw new UnauthorizedException('No Header Token available');
    }

    return this.announcementsService.deleteAnnouncement(tenantId,domain,id);

  }
}
