import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuditLogService } from '../../common/services/audit-log.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { user?: any }>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Serverda xatolik yuz berdi';
    let details: string[] | undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        exceptionResponse &&
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        const exceptionMessage = (
          exceptionResponse as { message: string | string[] }
        ).message;
        if (Array.isArray(exceptionMessage)) {
          details = exceptionMessage;
          message = exceptionMessage[0] ?? message;
        } else {
          message = exceptionMessage;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    if (request.user?.organizationId) {
      await this.auditLogService.logError({
        organizationId: request.user.organizationId,
        userId: request.user.id,
        branchId: request.user.branchId,
        message,
        stack: exception instanceof Error ? exception.stack : null,
        path: request.url,
        method: request.method,
        statusCode: status,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] ?? null,
        meta: {
          details,
          timestamp: new Date().toISOString(),
        },
      });
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
