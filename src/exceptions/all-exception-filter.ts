import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { createLogFromRequest } from 'src/core/express/request-helper';
import { LogService } from './../logger/log.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private logger: LogService,
    private config: ConfigService
  ) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const req = ctx.getRequest();
    const emailClaim = this.config.get<string>('EMAIL_CLAIM');

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    if (httpStatus !== HttpStatus.INTERNAL_SERVER_ERROR && exception.message) {
      responseBody['message'] = exception.message;
    }

    const { meta } = createLogFromRequest(req, emailClaim);

    this.logger.error({ message: `${exception.message} ${exception.stack}`, meta });

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
