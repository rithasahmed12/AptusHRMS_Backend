import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { TenantService } from '../tenant/tenant.service';
import { Tenant, TenantSchema } from '../tenant/schema/tenant.schema';
import { TenantMiddleware } from 'src/middlewares/tenants.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }])],
  controllers: [CompanyController],
  providers: [CompanyService, TenantService],
})
export class CompanyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes(CompanyController);
  }
}
