// src/auth/dto/register.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  // The storefront sends first_name; other clients send fullName.
  @ValidateIf((o: RegisterDto) => !o.first_name)
  @IsNotEmpty()
  fullName?: string;

  @ValidateIf((o: RegisterDto) => !o.fullName)
  @IsNotEmpty()
  first_name?: string;

  @IsOptional()
  @IsString()
  password_confirm?: string;
}
