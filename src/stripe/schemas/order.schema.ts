import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


@Schema({timestamps:true})

export class Order extends Document{
    @Prop()
    email:string

    @Prop()
    name:string

    @Prop()
    price:number
}

export const OrderSchema = SchemaFactory.createForClass(Order)