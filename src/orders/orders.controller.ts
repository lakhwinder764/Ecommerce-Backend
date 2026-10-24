import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';

type AuthedRequest = { user: { userId: string } };

@Controller('api/orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@Request() req: AuthedRequest, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.userId, dto);
  }

  @Get()
  list(@Request() req: AuthedRequest) {
    return this.ordersService.list(req.user.userId);
  }

  @Get(':id')
  detail(@Request() req: AuthedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.detail(req.user.userId, id);
  }
}
