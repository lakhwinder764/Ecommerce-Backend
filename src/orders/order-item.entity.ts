import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/products/product.entity';

// src/orders/order-item.entity.ts
@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  quantity: number;

  @Column('decimal')
  price: number;
}
