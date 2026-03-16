import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class CheckoutService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined in environment variables',
      );
    }
    this.stripe = new Stripe(secretKey);
  }

  async createCheckoutSession(
    products: { name?: string; price: number; amount?: number }[],
    successUrl?: string,
    cancelUrl?: string,
    origin?: string,
  ) {
    if (!products?.length) {
      throw new BadRequestException('No products in cart');
    }

    const baseUrl = origin || process.env.BASE_URL || 'http://localhost:3000';
    const shippingAmount = parseInt(process.env.STRIPE_SHIPPING_AMOUNT || '5000', 10);
    const finalSuccessUrl = successUrl || `${baseUrl}/success`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/cart`;

    const lineItems = products.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item?.name || 'Product',
        },
        unit_amount: Math.round((Number(item?.price) || 0) * 100),
      },
      quantity: item?.amount || 1,
    }));

    const session = await this.stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: shippingAmount,
              currency: 'inr',
            },
            display_name: 'Next day air',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 1,
              },
            },
          },
        },
      ],
      payment_method_types: ['card'],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
    });

    return { id: session.id, url: session.url };
  }
}
