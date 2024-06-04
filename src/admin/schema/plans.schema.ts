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
}

export const PlanSchema = SchemaFactory.createForClass(Plans);
