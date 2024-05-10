import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './schemas/otp.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('Otp')
    private readonly otpModel:Model<Otp>,
    private readonly mailerService: MailerService
) {}



  async sendOTP(body:{email:string}) {
    try {
        const email = body.email
        const otp = Math.floor(1000 + Math.random() * 9000);
        await this.mailerService.sendMail({
          to: email ,
          subject: 'Your One-Time Password',
          text: `Your OTP is: ${otp}`,
        });

        const otpDocument = new this.otpModel({email,otp})
        otpDocument.save();

        console.log(`OTP ${otp} sent to ${email}`);
    
        return {success:true, message:"OTP sent successfully"};
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, message: 'Failed to send OTP' };
    }
 
  }
}