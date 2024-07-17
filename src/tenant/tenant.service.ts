import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Tenant } from './schema/tenant.schema';
import { TenantInfoInterface } from 'src/company/interface/tenantInfo.interface';
import { UserSchema } from 'src/company/schemas/user.schema';
import { CompanySchema } from 'src/company/schemas/company.schema';

mongoose.set('debug', true);

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @Inject(getConnectionToken()) private connection: Connection,
  ) {}

  async getAllTenants(): Promise<TenantInfoInterface[]> {
    return this.tenantModel.find().lean();
  }

  async createTenant(
    tenantData: Partial<Tenant>,
    userData: { email: string; password: string },
  ): Promise<Tenant> {
    try {
      const newTenant = new this.tenantModel(tenantData);
      await newTenant.save();

      // Create new tenant database
      const tenantDb = this.connection.useDb(newTenant.tenantId, {
        useCache: true,
      });

      let userModel = tenantDb.models.User || tenantDb.model('User', UserSchema);
      let companyModel = tenantDb.models.Company || tenantDb.model('Company', CompanySchema);


      await userModel.create({
        email: userData.email,
        password: userData.password,
        role: 'admin',
      });

      await companyModel.create({
        logo: null,
      });

      this.logger.log(
        `Tenant ${newTenant.tenantId} created successfully with database tenant_${newTenant.tenantId}`,
      );
      return newTenant;
    } catch (error) {
      this.logger.error(
        `Failed to create tenant: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create tenant');
    }
  }

  async getTenantById(tenantId: string): Promise<Tenant | null> {
    return this.tenantModel.findOne({ tenantId }).exec();
  }

  async getTenantDatabase(
    tenantId: string,
    domain: string,
  ): Promise<Connection> {
    const tenant = await this.tenantModel.findOne({ tenantId, domain }).exec();
    console.log('Tenant:', tenant);

    if (!tenant) {
      throw new InternalServerErrorException('Tenant not found');
    }
    return this.connection.useDb(tenant.tenantId, { useCache: true });
  }
}
