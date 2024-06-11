import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { StripeModule } from './stripe/stripe.module';
import { AdminModule } from './admin/admin.module';
import { TenantModule } from './tenant/tenant.module';


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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri:`${process.env.DB_URI}`,
      }),
    }),
    UserModule,
    StripeModule,
    AdminModule,
    TenantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}