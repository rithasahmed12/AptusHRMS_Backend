import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ServiceStatus } from "../interface/enums";

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop()
  username: string;

  @Prop()
  phone: number;

  @Prop()
  company_name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  order_date: Date;

  @Prop()
  order_no: number;

  @Prop()
  expiry_date: Date;

  @Prop()
  plan: string;

  @Prop()
  price:string;
  
  @Prop({ type: String, enum: ServiceStatus, default: ServiceStatus.Pending })
  service_status: ServiceStatus;

  @Prop({ type: Boolean, default: false })
  is_approved: boolean;

  @Prop({ type: Boolean, default: false })
  is_blocked: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
