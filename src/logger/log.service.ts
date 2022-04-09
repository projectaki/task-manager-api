import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogLevel } from './log-level.enum';
import { Log } from './log.interface';
import { Log as LogSchema, LogDocument } from './schema/log.schema';

@Injectable()
export class LogService {
  constructor(@InjectModel(LogSchema.name) private readonly logModel: Model<LogDocument>) {}

  public log(log: Log) {
    this.logModel.create({
      level: LogLevel.INFO,
      message: log.message,
      meta: log.meta,
      timestamp: new Date(Date.now()),
    } as LogSchema);
  }

  public logMessage(msg: string) {
    this.logModel.create({
      level: LogLevel.INFO,
      message: msg,
      timestamp: new Date(Date.now()),
    } as LogSchema);
  }

  public error(log: Log) {
    this.logModel.create({
      level: LogLevel.ERROR,
      message: log.message,
      meta: log.meta,
      timestamp: new Date(Date.now()),
    } as LogSchema);
  }

  public warn(log: Log) {
    this.logModel.create({
      level: LogLevel.WARN,
      message: log.message,
      meta: log.meta,
      timestamp: new Date(Date.now()),
    } as LogSchema);
  }
}
