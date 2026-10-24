import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { PAYMENT_METHODS } from '../order.entity';
import type { PaymentMethod } from '../order.entity';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  full_name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @Matches(/^\d{6}$/, { message: 'pincode must be a 6-digit number' })
  pincode: string;

  @IsIn(PAYMENT_METHODS)
  payment_method: PaymentMethod;
}
