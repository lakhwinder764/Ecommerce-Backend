// src/auth/dto/auth-google.dto.ts
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class AuthGoogleDto {
  @ValidateIf((o) => !o.accessToken)
  @IsString()
  @IsNotEmpty({ message: 'Either idToken or accessToken is required' })
  idToken?: string;

  @ValidateIf((o) => !o.idToken)
  @IsString()
  @IsNotEmpty({ message: 'Either idToken or accessToken is required' })
  accessToken?: string;
}
