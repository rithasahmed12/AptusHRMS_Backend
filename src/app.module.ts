import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { StripeModule } from './stripe/stripe.module';
import { RawBodyMiddleware } from './middleware/raw-body.middleware';
import { JsonBodyMiddleware } from './middleware/json-body.middleware';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port:465,
        secure:true,
        auth: {
          user: 'assassinpg48@gmail.com',
          pass: 'fxky vyqu iotj dgzl',
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
          ciphers: 'SSLv3', // Set the SSL/TLS version explicitly
        },
      },
    }),
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URI),
    UserModule,
    StripeModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
      consumer
          .apply(RawBodyMiddleware)
          .forRoutes({
              path: '/webhook',
              method: RequestMethod.POST,
          })
          .apply(JsonBodyMiddleware)
          .forRoutes('*');
  }
}