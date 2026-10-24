import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { isUUID } from 'class-validator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CartOwner, CartService } from './cart.service';
import {
  AddToCartDto,
  RemoveCartItemDto,
  UpdateCartItemDto,
} from './dto/cart.dto';

const GUEST_CART_COOKIE = 'cart_id';
const GUEST_CART_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type CartRequest = express.Request & { user: { userId: string } | null };

// Guests keep their cart id in a cookie (works when the frontend is served
// from the same site) or send it back in an X-Cart-Id header.
function guestCartId(req: express.Request): string | undefined {
  const header = req.headers['x-cart-id'];
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim().split('='))
    .find(([name]) => name === GUEST_CART_COOKIE)?.[1];
  const id = (typeof header === 'string' ? header : undefined) ?? cookie;
  return id && isUUID(id) ? id : undefined;
}

@Controller('api/cart')
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async get(@Req() req: CartRequest) {
    const cart = await this.cartService.findCart(this.owner(req));
    return this.cartService.toResponse(cart);
  }

  @Post('add')
  async add(
    @Req() req: CartRequest,
    @Res({ passthrough: true }) res: express.Response,
    @Body() dto: AddToCartDto,
  ) {
    const cart = await this.cartService.addItem(this.owner(req), dto);
    if (!req.user && guestCartId(req) !== cart.id) {
      res.cookie(GUEST_CART_COOKIE, cart.id, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: GUEST_CART_MAX_AGE_MS,
      });
    }
    return this.cartService.toResponse(cart);
  }

  @Post('update')
  async update(@Req() req: CartRequest, @Body() dto: UpdateCartItemDto) {
    const cart = await this.cartService.updateItem(this.owner(req), dto);
    return this.cartService.toResponse(cart);
  }

  @Post('remove')
  async remove(@Req() req: CartRequest, @Body() dto: RemoveCartItemDto) {
    const cart = await this.cartService.removeItem(this.owner(req), dto);
    return this.cartService.toResponse(cart);
  }

  @Post('clear')
  async clear(@Req() req: CartRequest) {
    const cart = await this.cartService.clear(this.owner(req));
    return this.cartService.toResponse(cart);
  }

  @Post('sync')
  async sync(
    @Req() req: CartRequest,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    if (!req.user) throw new UnauthorizedException();
    const cart = await this.cartService.mergeGuestCart(
      req.user.userId,
      guestCartId(req),
    );
    res.clearCookie(GUEST_CART_COOKIE);
    return this.cartService.toResponse(cart);
  }

  private owner(req: CartRequest): CartOwner {
    return req.user
      ? { userId: req.user.userId }
      : { guestCartId: guestCartId(req) };
  }
}
