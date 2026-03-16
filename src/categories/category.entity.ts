import { Product } from 'src/products/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

// src/categories/category.entity.ts
@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
