import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { CartService } from '../cart/cart.service';
import { CartItem } from '../cart/cart-item.entity';
import { MailService } from '../mail/mail.service';
import { userRef } from '../users/user-ref';
import { toPaise, toStorefrontImages } from '../products/storefront-product';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private dataSource: DataSource,
    private cartService: CartService,
    private mailService: MailService,
  ) {}

  // Turns the user's cart into an order and empties the cart.
  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.cartService.findCart({ userId });
    if (!cart?.items.length) {
      throw new BadRequestException('Your cart is empty.');
    }

    const items = cart.items.map((item) => ({
      product: { id: item.product.id },
      name: item.product.title,
      color: item.color,
      quantity: item.quantity,
      price: toPaise(item.product.price),
    }));
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shippingFee = parseInt(
      process.env.STRIPE_SHIPPING_AMOUNT || '5000',
      10,
    );

    const saved = await this.dataSource.transaction(async (manager) => {
      const order = await manager.save(
        manager.create(Order, {
          user: userRef(userId),
          fullName: dto.full_name,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          pincode: dto.pincode,
          paymentMethod: dto.payment_method,
          subtotal,
          shippingFee,
          totalAmount: subtotal + shippingFee,
          items,
        }),
      );
      await manager
        .createQueryBuilder()
        .delete()
        .from(CartItem)
        .where('cartId = :cartId', { cartId: cart.id })
        .execute();
      return order;
    });

    const order = await this.findOwned(userId, saved.id);
    let emailSent = false;
    try {
      emailSent = await this.mailService.sendOrderConfirmationEmail(order);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Order #${order.id} confirmation email failed: ${msg}`);
    }

    return { order: this.toDetail(order), email_sent: emailSent };
  }

  async list(userId: string) {
    const orders = await this.orderRepo.find({
      where: { user: userRef(userId) },
      relations: { items: true },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    return orders.map((order) => this.toSummary(order));
  }

  async detail(userId: string, id: number) {
    return this.toDetail(await this.findOwned(userId, id));
  }

  private async findOwned(userId: string, id: number) {
    const order = await this.orderRepo.findOne({
      where: { id, user: userRef(userId) },
      relations: { items: { product: true } },
      order: { items: { id: 'ASC' } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private toSummary(order: Order) {
    return {
      id: order.id,
      created: order.createdAt,
      status: order.status,
      payment_method: order.paymentMethod,
      item_count: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total_amount: order.totalAmount,
    };
  }

  private toDetail(order: Order) {
    return {
      ...this.toSummary(order),
      full_name: order.fullName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      subtotal: order.subtotal,
      shipping_fee: order.shippingFee,
      items: order.items.map((item: OrderItem) => ({
        id: item.id,
        product: {
          id: item.product?.id ?? null,
          name: item.name,
          image: item.product
            ? toStorefrontImages(item.product)
            : [{ id: '', url: '', filename: item.name }],
        },
        color: item.color,
        quantity: item.quantity,
        price: item.price,
      })),
    };
  }
}
