// src/users/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
// import { Order } from '../orders/order.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // @OneToMany(() => Order, (order) => order.user)
  // orders: Order[];

  @CreateDateColumn()
  createdAt: Date;
}
