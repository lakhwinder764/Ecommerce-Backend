import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
