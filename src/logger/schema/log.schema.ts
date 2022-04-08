import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { LogLevel } from '../log-level.enum';
import { LogMetaData } from '../log.metadata';

export type LogDocument = Log & Document;

@Schema({
  versionKey: false,
  capped: {
    autoIndexId: true,
    size: 5242880,
  },
})
export class Log {
  _id: mongoose.Types.ObjectId;

  @Prop()
  message: string;

  @Prop({ enum: LogLevel })
  level: LogLevel;

  @Prop()
  timestamp: Date;

  @Prop({ type: LogMetaData, default: () => ({}), _id: false, versionKey: false })
  meta: LogMetaData;
}

export const LogSchema = SchemaFactory.createForClass(Log);
