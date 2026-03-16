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

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column()
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  profileImageUrl: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  googleId: string;

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
