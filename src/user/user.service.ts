import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './schemas/otp.schema';
import { Plans } from 'src/admin/schema/plans.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('Otp')
    private readonly otpModel:Model<Otp>,
    @InjectModel(Plans.name) private plansModel: Model<Plans>,
    private readonly mailerService: MailerService
) {}



  async sendOTP(body:{email:string}) {
    try {
        const {email} = body
        const otp:number = Math.floor(1000 + Math.random() * 9000);

        await this.mailerService.sendMail({
          to: email,
          subject: 'Verify Your Email for Order Purchase',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <header style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #734c4c;">Verify Your Email</h1>
              </header>
              <main>
                <p style="font-size: 16px; margin-bottom: 20px;">Dear Customer,</p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  To proceed with your order purchase, please use the following One-Time Password (OTP) to verify your email address:
                </p>
                <p style="font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; color: #734c4c;">${otp}</p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Enter this OTP on the order verification page to complete your purchase. Note that this OTP is valid for a <b>one minute</b> only.
                </p>
                <p style="font-size: 16px; margin-bottom: 20px;">Thank you for the purchase!</p>
              </main>
              <footer style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px; text-align: center;">
                <p style="font-size: 14px; color: #999;">If you did not initiate this purchase, please disregard this email.</p>
                <p style="font-size: 14px; color: #999;">&copy; 2024 AptusHR. All rights reserved.</p>
              </footer>
            </div>
          `,
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

  async getPlans(){
    const plans = await this.plansModel.find({is_listed:true});
    return plans;
  }


}



