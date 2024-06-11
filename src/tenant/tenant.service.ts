import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Tenant } from './schema/tenant.schema';

mongoose.set('debug', true);

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @Inject(getConnectionToken()) private connection: Connection
  ) {}

  async createTenant(tenantData: Partial<Tenant>,userData:{email:string,password:string}): Promise<Tenant> {
    try {
      const newTenant = new this.tenantModel(tenantData);
      await newTenant.save();

      // Create new tenant database
      const tenantDb = this.connection.useDb(newTenant.tenantId, { useCache: true });

      const userModel = tenantDb.model('User', new mongoose.Schema({
        email: { type: String, required: true },
        password: { type: String, required: true },
      }));
      
      await userModel.create({
        email:userData.email,
        password: userData.password,
      });

      this.logger.log(`Tenant ${newTenant.tenantId} created successfully with database tenant_${newTenant.tenantId}`);
      return newTenant;
    } catch (error) {
      this.logger.error(`Failed to create tenant: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create tenant');
    }
  }
}
