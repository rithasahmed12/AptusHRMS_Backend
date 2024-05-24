import { Injectable, Res } from '@nestjs/common';
import { Response } from 'express';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createStripeSessionSubscription(body, res) {
    try {
      let customer;
      const userEmail = body.email;
      const auth0UserId = userEmail;
      console.log('Received request body:', body);

      // Validate incoming data
      if (
        !body.email ||
        !body.product ||
        !body.product.name ||
        !body.product.description ||
        !body.product.price
      ) {
        throw new Error('Missing required fields in request body');
      }

      // Try to retrieve an existing customer by email
      const existingCustomers = await this.stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        // Customer already exists, retrieve the customer ID
        customer = existingCustomers.data[0];

        // Check if the customer already has an active subscription
        const subscriptions = await this.stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          // Customer already has an active subscription, send them to billing portal to manage subscription
          const returnUrl = 'http://localhost:5173/purchase';
          if (!returnUrl) {
            throw new Error('return_url is required and cannot be empty');
          }
          const stripeSession = await this.stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: returnUrl,
          });

          // Return a 409 Conflict status code and the redirectUrl
          return res.status(409).json({ redirectUrl: stripeSession.url });
        }
      } else {
        // No customer found, create a new one
        customer = await this.stripe.customers.create({
          email: userEmail,
          metadata: {
            userId: auth0UserId,
          },
          name: 'Jenny Rosen',
          address: {
            line1: '510 Townsend St',
            postal_code: '98140',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
          },
        });
      }

      // Now create the Stripe checkout session with the customer ID
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

      return res.status(200).json({ id: session.id });
    } catch (error) {
      console.error('Error creating Stripe session subscription:', error);
      throw new Error('Failed to create Stripe session subscription');
    }
  }
}