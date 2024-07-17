import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantService } from './tenant.service';
import { Tenant, TenantSchema } from './schema/tenant.schema';



@Module({
  imports: [MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
  TenantModule  
],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}