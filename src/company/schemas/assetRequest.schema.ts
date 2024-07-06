// asset-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class AssetRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Asset', required: true })
  assetId: Types.ObjectId;

  @Prop({ required: true })
  requestDate: Date;

  @Prop({ enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
  status: string;

  @Prop()
  reason: string;
}

export const AssetRequestSchema = SchemaFactory.createForClass(AssetRequest);