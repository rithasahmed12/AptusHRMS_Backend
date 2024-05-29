import { HttpException, HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import Stripe from 'stripe';
import { Order } from './schemas/order.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { json } from 'stream/consumers';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private endpointSecret: string;

  constructor(
    @InjectModel('Order')
    private readonly order: Model<Order>,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.endpointSecret = 'whsec_34e1b82ca140f2ab81ed8a2562703fdf61ad48d647baec163116b9752ef9ab01';
  }

  // Filter out circular references
  private filterCircularReferences(obj: any): any {
    delete obj.socket;
    delete obj.parser;

    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key]!== null) {
        this.filterCircularReferences(obj[key]);
      }
    });

    return obj;
  }

  async createStripeSessionSubscription(body, res) {
    try {
      let customer;
      const userEmail = body.customer.email;
      const auth0UserId = userEmail;

      const existingCustomers = await this.stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        const subscriptions = await this.stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const returnUrl = 'http://localhost:5173/purchase';
          if (!returnUrl) {
            throw new Error('return_url is required and cannot be empty');
          }
          const stripeSession = await this.stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: returnUrl,
          });

          return res.status(409).json(this.filterCircularReferences({ redirectUrl: stripeSession.url }));
        }
      } else {
        customer = await this.stripe.customers.create({
          email: userEmail,
          
  // product: {
  //   id: '2',
  //   name: 'Standard',
  //   price: 2999,
  //   description: '50 employees, 28 days'
  // },
  // customer: {
  //   name: 'Rithas Ahamed',
  //   mobile: '02112122121',
  //   domain: 'sam',
  //   email: 'ahmedrithas48@gmail.com',
  //   password: 'Fullmode12@'
  // }
          name: body.customer.name,
        });
      }

      const session = await this.stripe.checkout.sessions.create({
        success_url: 'http://localhost:5173/purchase/success',
        cancel_url: 'http://localhost:5173/purchase/plan',
        payment_method_types: ['card'],
        mode: 'subscription',
        billing_address_collection: 'auto',
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${body.product.name} Plan`,
                description: body.product.description,
              },
              unit_amount: body.product.price * 100,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: auth0UserId,
        },
        customer: customer.id,
      });

      return res.status(200).json(this.filterCircularReferences({ id: session.id }));
    } catch (error) {
      console.error('Error creating Stripe session subscription:', error);
      throw new Error('Failed to create Stripe session subscription');
    }
  }

  async handleWebhookEvent(body: Buffer, signature: string, req:Request) {
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, this.endpointSecret);
      
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'invoice.payment_succeeded':
        const session = event.data
        await this.createOrder(session,req);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  async createOrder(session,req) {
    console.log("session:",session);

    // Access the body from req.locals
  const body = req.session.body;
  console.log("body:", body);

  // Create the order using the data from the session and body
  const order = await this.order.create({
    customer: session.customer,
    amount: session.amount_total,
    currency: session.currency,
    // Add other relevant data from body or session
    ...body.product,
    ...body.customer,
  });
  }
}
