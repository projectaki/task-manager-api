import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { LogService } from './log.service';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  constructor(private logger: LogService, private config: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const user = this.getUserFromRequest(req);
    const emailClaim = this.config.get<string>('EMAIL_CLAIM');

    this.logger.log({
      message: `[${req.method}] ${decodeURIComponent(req.originalUrl)} ${user?.[emailClaim] || 'anonymous'}`,
      meta: {
        ip: req.ip,
        reqUrl: req.originalUrl,
        reqMethod: req.method,
        protocol: req.protocol,
        host: req.hostname,
        userAgent: req.headers['user-agent'],
        userEmail: user?.[emailClaim],
        userId: decodeURIComponent(user?.sub),
        userName: user?.name,
        userRole: user?.roles ? user.roles[0] : 'anonymous',
      },
    });
    next();
  }

  getUserFromRequest(req: Request) {
    const token = req.headers['authorization'];
    if (!token) return null;

    const buffer = Buffer.from(token.split('.')[1], 'base64');
    const payload = JSON.parse(buffer.toString());

    return payload;
  }
}
