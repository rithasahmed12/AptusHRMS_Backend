import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local-strategies';

@Module({
  providers: [AdminService, LocalStrategy],
  controllers: [AdminController],
  imports: [JwtModule.register({
    secret: `${process.env.JWT_SECRET}`,
    signOptions: { expiresIn: '3600s' },
  })],
})
export class AdminModule {}
