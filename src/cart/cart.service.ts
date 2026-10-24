import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';
import { userRef } from '../users/user-ref';
import {
  AddToCartDto,
  RemoveCartItemDto,
  UpdateCartItemDto,
} from './dto/cart.dto';
import {
  DEFAULT_STOCK,
  toStorefrontProduct,
} from '../products/storefront-product';

// A cart belongs to a signed-in user, or to a guest who holds its id.
export type CartOwner = { userId: string } | { guestCartId?: string };

const CART_RELATIONS = { items: { product: true } };
const CART_ORDER = { items: { createdAt: 'ASC' as const } };

const clampQuantity = (quantity: number) =>
  Math.min(Math.max(quantity, 1), DEFAULT_STOCK);

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private itemRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  findCart(owner: CartOwner): Promise<Cart | null> {
    if ('userId' in owner) {
      return this.cartRepo.findOne({
        where: { user: userRef(owner.userId) },
        relations: CART_RELATIONS,
        order: CART_ORDER,
      });
    }
    if (!owner.guestCartId) return Promise.resolve(null);
    return this.cartRepo.findOne({
      where: { id: owner.guestCartId, user: IsNull() },
      relations: CART_RELATIONS,
      order: CART_ORDER,
    });
  }

  async addItem(owner: CartOwner, dto: AddToCartDto): Promise<Cart> {
    const product = await this.productRepo.findOneBy({
      id: dto.product_id,
      isActive: true,
    });
    if (!product) throw new NotFoundException('Product not found');

    const cart = await this.getOrCreateCart(owner);
    await this.addToCart(cart, product.id, dto.color ?? '', dto.quantity ?? 1);
    return this.reload(cart.id);
  }

  async updateItem(owner: CartOwner, dto: UpdateCartItemDto): Promise<Cart> {
    const { cart, item } = await this.findItem(owner, dto.item_id);
    await this.itemRepo.update(item.id, {
      quantity: clampQuantity(dto.quantity),
    });
    return this.reload(cart.id);
  }

  async removeItem(owner: CartOwner, dto: RemoveCartItemDto): Promise<Cart> {
    const { cart, item } = await this.findItem(owner, dto.item_id);
    await this.itemRepo.delete(item.id);
    return this.reload(cart.id);
  }

  async clear(owner: CartOwner): Promise<Cart | null> {
    const cart = await this.findCart(owner);
    if (!cart) return null;
    await this.itemRepo
      .createQueryBuilder()
      .delete()
      .where('cartId = :cartId', { cartId: cart.id })
      .execute();
    return this.reload(cart.id);
  }

  // Called after login: moves a guest cart's items into the user's cart.
  async mergeGuestCart(userId: string, guestCartId?: string): Promise<Cart> {
    const userCart = await this.getOrCreateCart({ userId });
    const guestCart = await this.findCart({ guestCartId });
    if (guestCart) {
      for (const item of guestCart.items) {
        await this.addToCart(
          userCart,
          item.product.id,
          item.color,
          item.quantity,
        );
      }
      await this.cartRepo.delete(guestCart.id);
    }
    return this.reload(userCart.id);
  }

  toResponse(cart: Cart | null) {
    return {
      id: cart?.id ?? null,
      items: (cart?.items ?? []).map((item) => ({
        id: item.id,
        product: toStorefrontProduct(item.product),
        color: item.color,
        quantity: item.quantity,
      })),
    };
  }

  private async getOrCreateCart(owner: CartOwner): Promise<Cart> {
    const existing = await this.findCart(owner);
    if (existing) return existing;

    const cart = await this.cartRepo.save(
      this.cartRepo.create({
        user: 'userId' in owner ? userRef(owner.userId) : null,
      }),
    );
    cart.items = [];
    return cart;
  }

  private async addToCart(
    cart: Cart,
    productId: number,
    color: string,
    quantity: number,
  ) {
    const existing = cart.items.find(
      (item) => item.product.id === productId && item.color === color,
    );
    if (existing) {
      await this.itemRepo.update(existing.id, {
        quantity: clampQuantity(existing.quantity + quantity),
      });
      return;
    }
    await this.itemRepo.save(
      this.itemRepo.create({
        cart: { id: cart.id },
        product: { id: productId },
        color,
        quantity: clampQuantity(quantity),
      }),
    );
  }

  private async findItem(owner: CartOwner, itemId: string) {
    const cart = await this.findCart(owner);
    const item = cart?.items.find((cartItem) => cartItem.id === itemId);
    if (!cart || !item) throw new NotFoundException('Cart item not found');
    return { cart, item };
  }

  private reload(cartId: string) {
    return this.cartRepo.findOneOrFail({
      where: { id: cartId },
      relations: CART_RELATIONS,
      order: CART_ORDER,
    });
  }
}
