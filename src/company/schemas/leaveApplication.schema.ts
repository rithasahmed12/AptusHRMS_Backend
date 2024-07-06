// leave-application.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class LeaveApplication extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
  status: string;

  @Prop({ default: false })
  requiresApproval: boolean;
}

export const LeaveApplicationSchema = SchemaFactory.createForClass(LeaveApplication);