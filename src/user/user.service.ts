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
        const {email} = body
        const otp:number = Math.floor(1000 + Math.random() * 9000);
        await this.mailerService.sendMail({
          to: email ,
          subject: 'Your One-Time Password',
          text: `Your OTP is: ${otp}`,
        });

        const expiresAt = new Date(Date.now() + (1 * 60 * 1000));
        await this.otpModel.updateOne(
          { email },
          { $set: { otp,expiresAt} },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`OTP ${otp} sent to ${email}`);
    
        return {success:true, message:"OTP sent successfully"};
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, message: 'Failed to send OTP' };
    }
 
  }

  async verifyOtp(body:{otp:number,email:string}){
    try {
      const {otp,email} = body;
      
      const storedOtp = await this.otpModel.findOne({email:email});

      if(!storedOtp){
        return {success:false, message:"Otp not found"};
      }

      if(storedOtp.otp !== otp){
         return {success:false, message:"Incorrect Otp"};
      }

      if(new Date > storedOtp.expiresAt){
        return {success:false, message:"Otp expired Resend Otp"};
      }
  
      return {success:true,message:"Otp verified Sucessfully"};
      
    } catch (error) {
      return {error};
    }
  }
}