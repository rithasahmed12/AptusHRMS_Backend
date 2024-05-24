import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { OtpSchema } from './schemas/otp.schema';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[MongooseModule.forFeature([{name:"Otp",schema:OtpSchema}])],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
