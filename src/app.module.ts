import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { StripeModule } from './stripe/stripe.module';
import { AdminModule } from './admin/admin.module';
import { TenantModule } from './tenant/tenant.module';
import { CompanyModule } from './company/company.module';


@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port:465,
        secure:true,
        auth: {
          user: `${process.env.SENDER_EMAIL}`,
          pass: `${process.env.SENDER_PASS}`,
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3', 
        },
      },
    }),
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
    CompanyModule
  ],
})
export class AppModule {}