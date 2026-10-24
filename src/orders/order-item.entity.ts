import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/products/product.entity';

// src/orders/order-item.entity.ts
@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  // Set to null if the product is deleted; name and price keep the history.
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  product: Product | null;

  @Column()
  name: string;

  @Column({ default: '' })
  color: string;

  @Column()
  quantity: number;

  // Unit price in paise at the time of purchase.
  @Column('int')
  price: number;
}
