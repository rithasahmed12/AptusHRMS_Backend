import { Injectable } from '@nestjs/common';
import { AnnouncementDto } from '../dto/announcement.dto';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import { AnnouncementsSchema } from '../schemas/announcements.schema';
import { EditAnnouncementDto } from '../dto/editAnnouncement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly tenantService: TenantService) {}

  async createAnnouncements(
    tenantId: string,
    domain: string,
    announcementDto: AnnouncementDto,
  ): Promise<any> {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const announcementModel =
      tenantDb.models.Announcement ||
      tenantDb.model('Announcement', AnnouncementsSchema);

    const announcement = await announcementModel.create(announcementDto);

    return { message: 'Announcement created successfully!', announcement };
  }

  async getAnnouncements(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const announcementModel =
      tenantDb.models.Announcement ||
      tenantDb.model('Announcement', AnnouncementsSchema);

    return await announcementModel.find().sort({ createdAt: -1 });
  }

  async markRead(tenantId: string, domain: string, id: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const announcementModel =
      tenantDb.models.Announcement ||
      tenantDb.model('Announcement', AnnouncementsSchema);

    return await announcementModel.findByIdAndUpdate(
      { _id: id },
      { read: true },
      { new: true },
    );
  }

  async editAnnouncement(
    tenantId: string,
    domain: string,
    id: string,
    editAnnouncementDto: EditAnnouncementDto,
  ) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const announcementModel =
      tenantDb.models.Announcement ||
      tenantDb.model('Announcement', AnnouncementsSchema);

    return await announcementModel.findByIdAndUpdate(
      { _id: id },
      {
        title: editAnnouncementDto.title,
        details: editAnnouncementDto.details,
        author: editAnnouncementDto.author,
      },
      { new: true },
    );
  }

  async deleteAnnouncement(tenantId: string, domain: string, id: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    const announcementModel =
      tenantDb.models.Announcement ||
      tenantDb.model('Announcement', AnnouncementsSchema);

        await announcementModel.findByIdAndDelete({_id:id});

        return {message:"Announcement Deleted successfully!"}
  }
}
