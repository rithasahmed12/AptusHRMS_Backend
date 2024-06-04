import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local-strategies';
import { StripeModule } from '../stripe/stripe.module'; 
import { MongooseModule } from '@nestjs/mongoose';
import { PlanSchema } from './schema/plans.schema';

@Module({
  providers: [AdminService, LocalStrategy],
  controllers: [AdminController],
  imports: [JwtModule.register({
    secret: `${process.env.JWT_SECRET}`,
    signOptions: { expiresIn: '3600s' },
  }),
  StripeModule,
  MongooseModule.forFeature([{name:"Plans",schema:PlanSchema}])],
  
})
export class AdminModule {}
