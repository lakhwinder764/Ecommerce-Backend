import { Body, Controller, Post, Req } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Controller()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('create-checkout-session')
  @Post('api/create-checkout-session')
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @Req() req: { headers: { origin?: string } },
  ) {
    const origin = req.headers.origin;
    const result = await this.checkoutService.createCheckoutSession(
      dto.products,
      dto.success_url,
      dto.cancel_url,
      origin,
    );
    return result;
  }
}
