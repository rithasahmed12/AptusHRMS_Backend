import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { OtpSchema } from './schemas/otp.schema';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports:[MongooseModule.forFeature([{name:"Otp",schema:OtpSchema}]),
  AdminModule
],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
