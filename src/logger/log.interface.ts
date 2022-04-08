import { LogLevel } from './log-level.enum';
import { LogMetaData } from './log.metadata';

export interface Log {
  message: string;
  meta?: LogMetaData;
}
