import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  features?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  price?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
