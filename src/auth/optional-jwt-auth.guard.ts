// src/auth/optional-jwt-auth.guard.ts
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Lets requests without an Authorization header through as guests
// (req.user = null), but still rejects a bad or expired token.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(
    err: unknown,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const req = context
      .switchToHttp()
      .getRequest<{ headers: { authorization?: string } }>();
    if (!req.headers.authorization) return null as TUser;
    if (err || !user) throw new UnauthorizedException();
    return user;
  }
}
