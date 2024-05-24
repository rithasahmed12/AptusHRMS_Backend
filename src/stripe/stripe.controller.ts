import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { StripeService } from './stripe.service';

@Controller()
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('/create-checkout-session')
  async createStripeSessionSubscription(@Res() res: Response, @Body() body: any) {
    console.log(body)
   

    const result = await this.stripeService.createStripeSessionSubscription(
      body,res
    );

    if ('redirectUrl' in result) {
      return res.status(409).json(result);
    }

    res.json(result);
  }
}