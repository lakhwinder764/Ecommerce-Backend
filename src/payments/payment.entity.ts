import { User } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// src/payments/payment.entity.ts
@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stripePaymentIntentId: string;

  @ManyToOne(() => User)
  user: User;

  @Column('decimal')
  amount: number;

  @Column()
  currency: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
