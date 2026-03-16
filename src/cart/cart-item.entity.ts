import { Product } from 'src/products/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cart } from './cart.entity';

// src/cart/cart-item.entity.ts
@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items)
  cart: Cart;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  quantity: number;
}
