import { Body, Controller, Headers, Post, Req, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { StripeService } from './stripe.service';

@Controller()
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('/create-checkout-session')
  async createStripeSessionSubscription(
    @Res() res: Response,
     @Body() body: any,
     @Session() session: Record<string, any>
    ) {

      session.body = body;  

    const result = await this.stripeService.createStripeSessionSubscription(body, res);

    if ('redirectUrl' in result) {
      return res.status(409).json(result);
    }
    res.json(result);
  }

  @Post('/webhook')
  async handleWebhook(
    @Req() req: any,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,

  ) {
    try {  
      await this.stripeService.handleWebhookEvent(req.body, signature, req);
      res.status(200).json({ received: true });
    } catch (err) {
      console.error(`Webhooks Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
