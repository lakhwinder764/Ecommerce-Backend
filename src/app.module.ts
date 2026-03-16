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

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: process.env.DB_PASSWORD,
      database: 'nest_databases',
      entities: [User, Product, Category],
      synchronize: true, // Set to false in production
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
