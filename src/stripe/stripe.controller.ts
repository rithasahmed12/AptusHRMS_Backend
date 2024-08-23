import { Body, Controller, Headers, Post, Req, Res, RawBodyRequest } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';

@Controller('payment')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout-session')
  async createStripeSessionSubscription(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any
  ) {
    console.log(body);

    req.app.locals.body = body;  

    try {
      const result = await this.stripeService.createStripeSessionSubscription(body);
      res.json(result);
    } catch (error) {
      console.error('Error in createStripeSessionSubscription:', error);
      res.status(500).json({ error: error.message });
    }
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      console.log('req.headers:',signature);
      
      await this.stripeService.handleWebhookEvent(req.rawBody, signature, req);
      res.status(200).json({ received: true });
    } catch (err) {
      console.error(`Webhooks Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
// async getRawBody(req: any): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     let data = '';
//     req.on('data', (chunk) => {
//       data += chunk;
//     });
//     req.on('end', () => {
//       resolve(Buffer.from(data));
//     });
//     req.on('error', (err) => {
//       reject(err);
//     });
//   });
// }
