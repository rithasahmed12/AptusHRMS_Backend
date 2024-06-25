import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyController } from './controller/company.controller';
import { CompanyService } from './services/company.service';
import { TenantService } from '../tenant/tenant.service';
import { Tenant, TenantSchema } from '../tenant/schema/tenant.schema';
import { TenantMiddleware } from 'src/middlewares/tenants.middleware';
import { JwtModule } from '@nestjs/jwt';
import { AnnouncementsController } from './controller/announcements.controller';
import { AnnouncementsService } from './services/announcements.service';
import { DepartmentController } from './controller/department.controller';
import { DepartmentService } from './services/department.service';
import { DesignationController } from './controller/designation.controller';
import { DesignationService } from './services/designation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '3600s' },
    })
  ],
  controllers: [CompanyController,AnnouncementsController,DepartmentController,DesignationController],
  providers: [CompanyService, TenantService,AnnouncementsService,DepartmentService,DesignationService],
})
export class CompanyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes(CompanyController);
  }
}
