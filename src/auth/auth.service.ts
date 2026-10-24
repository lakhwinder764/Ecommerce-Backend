// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGoogleDto } from './dto/auth-google.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly RESET_TOKEN_EXPIRY_MINUTES = 5;
  // Refresh tokens use their own secret so they can't pass as access tokens.
  private readonly refreshSecret =
    process.env.JWT_REFRESH_SECRET ||
    `${process.env.JWT_SECRET || 'MY_SECRET_KEY'}:refresh`;
  private readonly refreshExpiresIn =
    parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '', 10) || 7 * 86400;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectRepository(PasswordResetToken)
    private resetTokenRepo: Repository<PasswordResetToken>,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }
    if (
      dto.password_confirm !== undefined &&
      dto.password_confirm !== dto.password
    ) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName ?? dto.first_name,
    });
    return {
      message: 'Registered Successfully!',
    };
    // return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google Sign-In. Please sign in with Google.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  async googleLogin(dto: AuthGoogleDto) {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      throw new BadRequestException(
        'GOOGLE_CLIENT_ID is not configured on the server',
      );
    }

    let payload: { sub: string; email?: string; name?: string; picture?: string };

    if (dto.idToken) {
      const client = new OAuth2Client(clientId);
      let ticket;
      try {
        ticket = await client.verifyIdToken({
          idToken: dto.idToken,
          audience: clientId,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Invalid Google ID token';
        const msg = message.includes('audience')
          ? 'Token audience mismatch. Ensure frontend uses the same Web Client ID as GOOGLE_CLIENT_ID.'
          : message.includes('expired')
            ? 'Google token has expired. Please sign in again.'
            : 'Invalid Google ID token';
        throw new UnauthorizedException(msg);
      }
      payload = ticket.getPayload()!;
    } else if (dto.accessToken) {
      const res = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${dto.accessToken}` },
        },
      );
      if (!res.ok) {
        throw new UnauthorizedException(
          'Invalid Google access token. Prefer idToken (credential) from GoogleLogin component.',
        );
      }
      const data = await res.json();
      payload = {
        sub: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
      };
    } else {
      throw new BadRequestException('Either idToken or accessToken is required');
    }

    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token: email not found');
    }

    let user = await this.usersService.findByGoogleId(payload.sub);
    if (!user) {
      user = await this.usersService.findByEmail(payload.email);
      if (user) {
        await this.usersService.updateGoogleProfile(user.id, {
          googleId: payload.sub,
          profileImageUrl: payload.picture ?? undefined,
        });
      } else {
        user = await this.usersService.create({
          email: payload.email,
          fullName: payload.name ?? payload.email.split('@')[0],
          profileImageUrl: payload.picture ?? undefined,
          googleId: payload.sub,
        });
      }
    }

    return this.generateToken(user);
  }

  async getProfile(userId: string | number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.toUserResponse(user);
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: { sub: string; type?: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.refresh, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user =
      payload.type === 'refresh'
        ? await this.usersService.findById(payload.sub)
        : null;
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { access, refresh } = this.generateToken(user);
    return { access, refresh };
  }

  private toUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      first_name: user.fullName,
      profileImageUrl: user.profileImageUrl ?? null,
    };
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      access: accessToken,
      refresh: this.jwtService.sign(
        { ...payload, type: 'refresh' },
        { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn },
      ),
      user: this.toUserResponse(user),
      message: 'Logged In Successfully !',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('No account found with this email.');
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.RESET_TOKEN_EXPIRY_MINUTES);

    await this.resetTokenRepo.save({
      token,
      userId: String(user.id),
      expiresAt,
    });

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.fullName,
      token,
    );

    return {
      message:
        'Reset password email sent. Check your inbox. The link will expire in 5 minutes.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetToken = await this.resetTokenRepo.findOne({
      where: { token: dto.token },
    });

    if (!resetToken || new Date() > resetToken.expiresAt) {
      throw new BadRequestException(
        'Invalid or expired reset token. Please request a new password reset.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.updatePassword(
      resetToken.userId,
      hashedPassword,
    );

    await this.resetTokenRepo.delete({ id: resetToken.id });

    return {
      message:
        'Password reset successfully. Please login with your new password.',
    };
  }
}
