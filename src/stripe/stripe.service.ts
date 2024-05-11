import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' }); // Update the API version if needed
  }

  checkout(cart: any) {
    const totalPrice = 1000; // Update this with the actual total price calculation
    console.log(cart);

    return this.stripe.paymentIntents.create({
        amount: totalPrice * 100,
        currency: 'usd',
        payment_method_types: ['card'],
        confirm: true,
        setup_future_usage: 'off_session'
    });
  }
}