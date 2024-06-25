import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import { AnnouncementsSchema } from '../schemas/announcements.schema';
import { AnnouncementDto } from '../dto/create.dto';
import { EditAnnouncementDto } from '../dto/edit.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly tenantService: TenantService) {}

  private async getAnnouncementModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(tenantId, domain);
    return tenantDb.models.Announcement || tenantDb.model('Announcement', AnnouncementsSchema);
  }

  async createAnnouncements(tenantId: string, domain: string, announcementDto: AnnouncementDto) {
    const announcementModel = await this.getAnnouncementModel(tenantId, domain);
    const announcement = await announcementModel.create(announcementDto);
    return { message: 'Announcement created successfully!', announcement };
  }

  async getAnnouncements(tenantId: string, domain: string) {
    const announcementModel = await this.getAnnouncementModel(tenantId, domain);
    return await announcementModel.find().sort({ createdAt: -1 });
  }

  async markRead(tenantId: string, domain: string, id: string) {
    const announcementModel = await this.getAnnouncementModel(tenantId, domain);
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
    const announcementModel = await this.getAnnouncementModel(tenantId, domain);
    return await announcementModel.findByIdAndUpdate(
      { _id: id },
      { title: editAnnouncementDto.title, details: editAnnouncementDto.details, author: editAnnouncementDto.author },
      { new: true },
    );
  }

  async deleteAnnouncement(tenantId: string, domain: string, id: string) {
    const announcementModel = await this.getAnnouncementModel(tenantId, domain);
    await announcementModel.findByIdAndDelete({ _id: id });
    return { message: "Announcement Deleted successfully!" };
  }
}
