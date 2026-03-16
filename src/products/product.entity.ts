import { Category } from 'src/categories/category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// src/products/product.entity.ts
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  features: string;

@Column({ type: 'longblob', nullable: true })
  image: Buffer;

  @Column({ nullable: true })
  imageType: string; // e.g. 'image/jpeg', 'image/png'

  @Column({ nullable: true })
  imageUrl: string; // External URL (e.g. Unsplash) when image buffer not used

  @Column('decimal')
  price: number;

  @ManyToOne(() => Category, (cat) => cat.products)
  category: Category;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
