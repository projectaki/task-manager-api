import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { createLogFromRequest } from 'src/core/express/request-helper';
import { LogService } from './log.service';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  constructor(private logger: LogService, private config: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const emailClaim = this.config.get<string>('EMAIL_CLAIM');

    const log = createLogFromRequest(req, emailClaim);

    this.logger.log(log);

    next();
  }
}
