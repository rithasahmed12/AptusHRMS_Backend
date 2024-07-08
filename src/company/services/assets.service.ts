// asset.service.ts
import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { TenantService } from 'src/tenant/tenant.service';
import { CreateAssetDto } from '../dto/create.dto';
import { UpdateAssetDto } from '../dto/edit.dto';
import Asset, { AssetSchema } from '../schemas/assets.schema';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { UserSchema } from '../schemas/user.schema';
import AssetRequest, {
  AssetRequestSchema,
} from '../schemas/assetRequest.schema';

@Injectable()
export class AssetService {
  constructor(
    private readonly tenantService: TenantService,
    private configService: ConfigService,
  ) {
    const cloudinaryConfig = this.configService.get('cloudinary');
    cloudinary.config(cloudinaryConfig);
  }

  private async getAssetModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    return tenantDb.models.Asset || tenantDb.model('Asset', AssetSchema);
  }

  private async getUserModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    return tenantDb.models.User || tenantDb.model('User', UserSchema);
  }

  private async getAssetRequestModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    return (
      tenantDb.models.AssetRequest ||
      tenantDb.model('AssetRequest', AssetRequestSchema)
    );
  }

  async getAllAssets(
    tenantId: string,
    domain: string,
  ): Promise<(typeof Asset)[]> {
    const assetModel = await this.getAssetModel(tenantId, domain);
    const userModel = await this.getUserModel(tenantId, domain);
    return assetModel
      .find()
      .populate([{ path: 'assignedTo', model: userModel }])
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getAsset(
    tenantId: string,
    domain: string,
    id: string,
  ): Promise<(typeof Asset)[]> {
    const assetModel = await this.getAssetModel(tenantId, domain);
    const userModel = await this.getUserModel(tenantId, domain);

    return assetModel
      .findById(id)
      .populate([{ path: 'assignedTo', model: userModel }])
      .sort({ updatedAt: -1 })
      .exec();
  }

  async createAsset(
    tenantId: string,
    domain: string,
    createAssetDto: CreateAssetDto,
    file: Express.Multer.File,
  ): Promise<any> {
    const assetModel = await this.getAssetModel(tenantId, domain);
    console.log('File:', file);

    let imageUrl: string | undefined;

    if (file) {
      try {
        imageUrl = await this.uploadToCloudinary(file);

        createAssetDto.image = imageUrl;
      } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        throw new Error('Failed to upload image');
      }
    }

    let assetId: string =
      'A' + Math.floor(Math.random() * 900 + 100).toString();

    const newAsset = new assetModel({
      ...createAssetDto,
      assetId: assetId,
    });

    try {
      const savedAsset = await newAsset.save();
      return savedAsset;
    } catch (error) {
      console.error('Error saving asset:', error);
      throw new Error('Failed to save asset');
    }
  }

  async updateAsset(
    tenantId: string,
    domain: string,
    id: string,
    updateAssetDto: UpdateAssetDto,
    file: Express.Multer.File,
  ): Promise<typeof Asset> {
    const assetModel = await this.getAssetModel(tenantId, domain);

    const existingAsset = await assetModel.findById(id).exec();
    if (!existingAsset) {
      throw new Error('Asset not found');
    }

    let imageUrl: string | undefined;

    if (file) {
      try {
        if (existingAsset.image) {
          await this.deleteFromCloudinary(existingAsset.image);
        }

        imageUrl = await this.uploadToCloudinary(file);

        updateAssetDto.image = imageUrl;
      } catch (error) {
        console.error('Error handling image:', error);
        throw new Error('Failed to process image');
      }
    }

    try {
      Object.keys(updateAssetDto).forEach(
        (key) =>
          updateAssetDto[key] === undefined && delete updateAssetDto[key],
      );
      const updatedAsset = await assetModel
        .findOneAndUpdate({ _id: id }, { $set: updateAssetDto }, { new: true })
        .exec();

      if (!updatedAsset) {
        throw new Error('Asset not found after update');
      }

      return updatedAsset;
    } catch (error) {
      console.error('Error updating asset:', error);
      throw new Error('Failed to update asset');
    }
  }

  async deleteAsset(
    tenantId: string,
    domain: string,
    id: string,
  ): Promise<typeof Asset> {
    const assetModel = await this.getAssetModel(tenantId, domain);
    return assetModel.findOneAndDelete({ _id: id }).exec();
  }

  async assignAsset(
    tenantId: string,
    domain: string,
    id: string,
    assignedTo: string,
  ): Promise<typeof Asset> {
    const assetModel = await this.getAssetModel(tenantId, domain);
    return assetModel
      .findOneAndUpdate(
        { _id: id },
        { assignedTo, status: 'In Use' },
        { new: true },
      )
      .exec();
  }

  async requestAsset(
    tenantId: string,
    domain: string,
    id: string,
    userId: string,
  ): Promise<{ asset: typeof Asset; request: typeof AssetRequest }> {
    const assetModel = await this.getAssetModel(tenantId, domain);
    const assetRequestModel = await this.getAssetRequestModel(tenantId, domain);

    const session = await assetModel.db.startSession();
    session.startTransaction();

    try {
      const asset = await assetModel.findById({ _id: id }).exec();

      if (!asset) {
        throw new Error('Asset not found');
      }

      const newAssetRequest = new assetRequestModel({
        userId,
        assetId: id,
        requestDate: new Date(),
        status: 'Pending',
        reason: 'Asset requested for maintenance',
      });

      const savedAssetRequest = await newAssetRequest.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { asset: asset, request: savedAssetRequest };
    } catch (error) {
     
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getAssetApplication(
    tenantId: string,
    domain: string,
  ): Promise<(typeof AssetRequest)[]> { 
    const assetRequestModel = await this.getAssetRequestModel(tenantId, domain);
    const assetModel = await this.getAssetModel(tenantId, domain);
    const userModel = await this.getUserModel(tenantId, domain);

    return await assetRequestModel
      .find({})
      .populate([
        { path: 'assetId', model: assetModel },
        { path: 'userId', model: userModel },
      ])
      .sort({ updatedAt: -1 });
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'employee_profiles' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );

      upload.end(file.buffer);
    });
  }

  private async deleteFromCloudinary(imageUrl: string) {
    console.log('imageUrl:', imageUrl);

    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    const publicId = filename.split('.')[0];

    console.log('publicId:', publicId);

    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(
          `employee_profiles/${publicId}`,
        );
        console.log('Cloudinary delete result:', result);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    } else {
      console.log('No valid public_id found in profileImage URL');
    }
  }

  async updateAssetRequestStatus(
    tenantId: string,
    domain: string,
    requestId: string,
    status: 'Approved' | 'Rejected'
  ): Promise<typeof AssetRequest> {
    const assetRequestModel = await this.getAssetRequestModel(tenantId, domain);
    const assetModel = await this.getAssetModel(tenantId, domain);

    const session = await assetRequestModel.db.startSession();
    session.startTransaction();

    try {
      const assetRequest = await assetRequestModel.findById(requestId).session(session);
      if (!assetRequest) {
        throw new Error('Asset request not found');
      }

      assetRequest.status = status;
      await assetRequest.save({ session });

      if (status === 'Approved') {
        const asset = await assetModel.findById(assetRequest.assetId).session(session);
        if (!asset) {
          throw new Error('Asset not found');
        }
        asset.assignedTo = assetRequest.userId;
        asset.status = 'In Use';
        await asset.save({ session });
      }

      await session.commitTransaction();
      return assetRequest;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
