import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


@Schema({timestamps:true})

export class Otp extends Document{
    @Prop({unique:[true,'Duplicate email entered']})
    email:string

    @Prop()
    otp:number

    @Prop()
    expiresAt:Date
}

export const OtpSchema = SchemaFactory.createForClass(Otp)

// Set the expiresAt property to the current time plus 2 minutes
OtpSchema.pre('save', function (next) {
    const now = new Date();
    this.expiresAt = new Date(now.getTime() + 2 * 60000);
    next();
  });