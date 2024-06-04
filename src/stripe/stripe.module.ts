import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeService } from './stripe.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { RawBodyMiddleware } from './middleware/raw-body.middleware';
import { JsonBodyMiddleware } from './middleware/json-body.middleware';




@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [MongooseModule],
})
export class StripeModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
      consumer
          .apply(RawBodyMiddleware)
          .forRoutes({
              path: '/payment/webhook',
              method: RequestMethod.POST,
          })
          .apply(JsonBodyMiddleware)
          .forRoutes('*');
  }
}

export { Order }; 