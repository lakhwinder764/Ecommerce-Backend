import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export const PAYMENT_METHODS = ['cod', 'upi', 'card'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// src/orders/order.entity.ts
// Money columns are in paise.
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: ['insert'] })
  items: OrderItem[];

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  pincode: string;

  @Column({ type: 'varchar', length: 10 })
  paymentMethod: PaymentMethod;

  // No payment is collected yet, so every order starts as pending.
  @Column({ default: 'pending' })
  status: string;

  @Column('int')
  subtotal: number;

  @Column('int')
  shippingFee: number;

  @Column('int')
  totalAmount: number;

  @CreateDateColumn()
  createdAt: Date;
}
