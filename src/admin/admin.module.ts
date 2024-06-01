import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AdminController],
  providers: [AdminService,JwtService],
  imports:[JwtModule.register({
    secret:process.env.JWT_SECRET,
    signOptions:{expiresIn:"3600s"}
  })]
})
export class AdminModule {}
