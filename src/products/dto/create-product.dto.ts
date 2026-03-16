import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  features?: string;

  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  price: number;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
