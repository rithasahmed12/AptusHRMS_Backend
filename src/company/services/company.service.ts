import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { TenantService } from '../../tenant/tenant.service';
import { UserSchema } from '../schemas/user.schema';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { Otp, OtpSchema } from 'src/user/schemas/otp.schema';
import { UpsertCompanyDto } from '../dto/create.dto';
import { v2 as cloudinary } from 'cloudinary';
import { CompanySchema } from '../schemas/company.schema';

@Injectable()
export class CompanyService {
  constructor(
    private jwtService: JwtService,
    private readonly tenantService: TenantService,
    private readonly mailerService: MailerService,
  ) {}

  private async getUserModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    return tenantDb.models.User || tenantDb.model('User', UserSchema);
  }

  private async getOtpModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    return tenantDb.models.Otp || tenantDb.model('Otp', OtpSchema);
  }

  async getCompanyInfo(tenantId: string, domain: string) {
    const companyModel = await this.getCompanyModel(tenantId, domain);
    return await companyModel.findOne();
  }

  async login(
    tenantId: string,
    domain: string,
    body: { email: string; password: string },
    response: Response,
  ): Promise<any> {
    try {
      const { email, password } = body;
      const userModel = await this.getUserModel(tenantId, domain);
      const companyModel = await this.getCompanyModel(tenantId, domain);

      const company = await companyModel.findOne();

      const user = await userModel.findOne({ email }).exec();
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('password:', password);
      console.log('userpassword:', user.password);

      if (!bcrypt) {
        console.error('bcrypt is not defined');
        throw new Error('bcrypt is not available');
      }

      if (typeof bcrypt.compare !== 'function') {
        console.error('bcrypt.compare is not a function');
        throw new Error('bcrypt.compare is not available');
      }

      let isPasswordValid;
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
        console.error('Error during password comparison:', bcryptError);
        throw new Error('Password comparison failed');
      }

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = { username: email ,role: user.role };
      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      });

      response.cookie('companyJwt', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return {
        message: 'Login successful',
        id: user._id,
        email: body.email,
        accessToken: token,
        role:user.role,
        profilePic: user.profilePic || null,
        logo:company.logo ? company.logo : '',
        companyName:company.name
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.log(error);

      throw new UnauthorizedException('Login Failed!', error);
    }
  }

  async sendOTP(tenantId: string, domain: string, email: string) {
    try {
      const UserModel = await this.getUserModel(tenantId, domain);
      const OtpModel = await this.getOtpModel(tenantId, domain);

      console.log('email:', email);

      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      const otp: number = Math.floor(1000 + Math.random() * 9000);

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

      const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
      await OtpModel.updateOne(
        { email },
        { $set: { otp, expiresAt } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      console.log(`OTP ${otp} sent to ${email}`);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOTP(
    tenantId: string,
    domain: string,
    body: { email: string; otpString: string },
  ) {
    try {
      const { email, otpString } = body;
      const OtpModel = (await this.getOtpModel(tenantId, domain)) as Model<Otp>;

      const otp = Number(otpString);

      const otpSchema = await OtpModel.findOne({ email, otp });

      if (!otpSchema) {
        return { success: false, message: 'Invalid OTP' };
      }

      if (otpSchema.expiresAt < new Date()) {
        return { success: false, message: 'OTP has expired' };
      }

      await OtpModel.updateOne({ email }, { $unset: { otp: 1, expiresAt: 1 } });

      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }

  async changePassword(
    tenantId: string,
    domain: string,
    body: { email: string; newPassword: string },
  ) {
    try {
      const { email, newPassword } = body;
      const UserModel = await this.getUserModel(tenantId, domain);

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const result = await UserModel.updateOne(
        { email },
        { $set: { password: hashedPassword } },
      );

      if (result.modifiedCount === 0) {
        return {
          success: false,
          message: 'User not found or password not changed',
        };
      }
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, message: 'Failed to change password' };
    }
  }
  async upsertCompany(
    tenantId: string,
    domain: string,
    companyDto: UpsertCompanyDto,
    file?: Express.Multer.File,
  ) {
    const companyModel = await this.getCompanyModel(tenantId, domain);

    let company;
    if (companyDto._id) {
      company = await companyModel.findById(companyDto._id);
      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    let logoUrl = company?.logo;
    if (file) {
      if (company?.logo) {
        await this.deleteFromCloudinary(company.logo);
      }
      logoUrl = await this.uploadToCloudinary(file);
    }

    const upsertData = {
      ...companyDto,
      logo: logoUrl,
    };

    if (company) {
      company = await companyModel.findByIdAndUpdate(
        companyDto._id,
        upsertData,
        { new: true },
      );
    } else {
      company = new companyModel(upsertData);
      await company.save();
    }

    return company;
  }

  private async getCompanyModel(tenantId: string, domain: string) {
    const tenantDb: Connection = await this.tenantService.getTenantDatabase(
      tenantId,
      domain,
    );
    return tenantDb.models.Company || tenantDb.model('Company', CompanySchema);
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'company_logos' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );

      upload.end(file.buffer);
    });
  }

  private async deleteFromCloudinary(imageUrl: string) {
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    const publicId = filename.split('.')[0];

    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(
          `company_logos/${publicId}`,
        );
        console.log('Cloudinary delete result:', result);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    } else {
      console.log('No valid public_id found in logo URL');
    }
  }
}
