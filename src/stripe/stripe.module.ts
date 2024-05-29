import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeService } from './stripe.service';
import { OrderSchema } from './schemas/order.schema';
// import { RawBodyMiddleware } from './middleware/raw-body.middleware';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
  ],
  controllers: [StripeController],
  providers: [StripeService]
})
export class StripeModule {}

