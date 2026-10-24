import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';
import { StorefrontProductController } from './storefront-products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductService],
  controllers: [ProductController, StorefrontProductController],
})
export class ProductModule {}
