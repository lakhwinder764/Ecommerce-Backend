// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PasswordResetToken } from './entities/password-reset-token.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    MailModule,
    TypeOrmModule.forFeature([PasswordResetToken]),
    JwtModule.registerAsync({
      useFactory: () => {
        const expiresIn = process.env.JWT_EXPIRES_IN || '86400';
        const expiresInNum = parseInt(expiresIn, 10);
        return {
          secret: process.env.JWT_SECRET || 'MY_SECRET_KEY',
          signOptions: {
            expiresIn: !Number.isNaN(expiresInNum) ? expiresInNum : 86400,
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
