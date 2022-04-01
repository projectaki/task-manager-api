import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TaskTag } from 'src/core/enums/task-tag.enum';

export type TaskDocument = Task & Document;

@Schema({ versionKey: false, timestamps: true })
export class Task {
  _id: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  completed: boolean;

  @Prop({ enum: TaskTag })
  tag: TaskTag;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
