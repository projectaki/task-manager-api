import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DBConfig } from 'src/config/configuration';
import winston from 'winston';
import { MongoDB } from 'winston-mongodb';
import { LogLevel } from './log-level.enum';
import { Log } from './log.interface';

@Injectable()
export class LogService {
  private logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = winston.createLogger({
      transports: [
        new MongoDB({
          db: configService.get<DBConfig>('database').uri,
          tryReconnect: true,
          collection: 'requestLogs',
          level: 'info',
          options: { useUnifiedTopology: true },
          metaKey: 'meta',
        }),
        new MongoDB({
          db: configService.get<DBConfig>('database').uri,
          tryReconnect: true,
          collection: 'errorLogs',
          level: 'info',
          options: { useUnifiedTopology: true },
          metaKey: 'meta',
        }),
      ],
      defaultMeta: { service: 'logger' },
    });
  }

  public log(log: Log) {
    this.logger.info({ ...log, level: LogLevel.INFO });
  }

  public error(log: Log) {
    this.logger.error({ ...log, level: LogLevel.ERROR });
  }

  public warn(log: Log) {
    this.logger.warn({ ...log, level: LogLevel.WARN });
  }
}
