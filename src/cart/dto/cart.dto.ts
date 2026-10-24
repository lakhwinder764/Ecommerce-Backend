import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class AddToCartDto {
  @Type(() => Number)
  @IsInt()
  product_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;
}

export class UpdateCartItemDto {
  @IsUUID()
  item_id: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class RemoveCartItemDto {
  @IsUUID()
  item_id: string;
}
