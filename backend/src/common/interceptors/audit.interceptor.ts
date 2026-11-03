import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_ACTION_KEY, AuditMetadata } from '../decorators/audit.decorator';
import { AuditLogService } from '../../modules/audit-log/audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMeta = this.reflector.getAllAndOverride<AuditMetadata>(AUDIT_ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!auditMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress || request.ip;
    const resourceId = request.params?.id || request.body?.id || null;

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Resolve authenticated user from request or login response payload
          const resolvedUser = user || data?.data?.user || data?.user;
          const resolvedUserId = resolvedUser?.id || null;
          const resolvedRole = resolvedUser?.role || 'ANONYMOUS';

          // Asynchronously record success audit event
          this.auditLogService.logAction({
            userId: resolvedUserId,
            action: auditMeta.action,
            resourceEntity: auditMeta.resource,
            resourceId: resourceId || data?.id || data?.data?.id || null,
            ipAddress: typeof ip === 'string' ? ip.slice(0, 45) : null,
            isAuthorized: true,
            details: {
              method: request.method,
              url: request.url,
              role: resolvedRole,
              email: resolvedUser?.email || request.body?.email || undefined,
            },
          }).catch((err) => {
            this.logger.error(`Audit logging failed: ${err.message}`);
          });
        },
        error: (error) => {
          // Asynchronously record security / failure audit event
          const status = error.status || 500;
          this.auditLogService.logAction({
            userId: user?.id || null,
            action: auditMeta.action,
            resourceEntity: auditMeta.resource,
            resourceId: resourceId || null,
            ipAddress: typeof ip === 'string' ? ip.slice(0, 45) : null,
            isAuthorized: status !== 401 && status !== 403,
            details: {
              method: request.method,
              url: request.url,
              errorStatus: status,
              errorMessage: error.message,
            },
          }).catch((err) => {
            this.logger.error(`Audit logging failed: ${err.message}`);
          });
        },
      }),
    );
  }
}

