import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

// Adds a readable `detail` string to error bodies, which the storefront
// shows to users. The rest of Nest's default error body is unchanged.
@Catch(HttpException)
export class HttpExceptionDetailFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();
    const payload: Record<string, unknown> =
      typeof body === 'string'
        ? { statusCode: status, message: body }
        : { ...body };
    const message = payload.message;

    res.status(status).json({
      ...payload,
      detail: Array.isArray(message) ? message.join('. ') : message,
    });
  }
}
