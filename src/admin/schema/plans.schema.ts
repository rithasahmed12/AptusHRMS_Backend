import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Plans extends Document {
  @Prop()
  plan_name: string;

  @Prop()
  plan_price: number;

  @Prop()
  duration: number;

  @Prop()
  max_employees: number;

  @Prop({ type: Boolean, default: true })
  is_listed: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plans);
