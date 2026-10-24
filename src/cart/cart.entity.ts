import { User } from 'src/users/users.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

// src/cart/cart.entity.ts
@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Null for guest carts, which are identified by their id instead.
  @OneToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User | null;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;
}
