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

// src/orders/order.entity.ts
@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @Column('decimal')
  totalAmount: number;

  @Column()
  status: 'PAID' | 'PENDING' | 'FAILED';

  @CreateDateColumn()
  createdAt: Date;
}
