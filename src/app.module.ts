import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/users.entity';
import { ProductModule } from './products/products.module';
import { Product } from './products/product.entity';
import { Category } from './categories/category.entity';
import { PasswordResetToken } from './auth/entities/password-reset-token.entity';
import { CheckoutModule } from './checkout/checkout.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'nest_databases',
      entities: [User, Product, Category, PasswordResetToken],
      synchronize: true, // Set to false in production
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    ProductModule,
    CheckoutModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
