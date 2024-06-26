import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' })
  status: string;

  @Prop({ required: true, min: 0, max: 100, default: 0 })
  progress: number;

  @Prop({ required: true, enum: ['Low', 'Medium', 'High'] })
  priority: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  assignedPerson: MongooseSchema.Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
