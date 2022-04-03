import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { TaskTag } from 'src/core/enums/task-tag.enum';
import { TaskDto } from '../dto/task.dto';

export type TaskDocument = Task & Document;

@Schema({ versionKey: false, timestamps: true })
export class Task {
  _id: mongoose.Types.ObjectId;

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

  toDto = (): TaskDto => {
    return {
      id: this._id.toString(),
      title: this.title,
      description: this.description,
      completed: this.completed,
      tag: this.tag,
    } as TaskDto;
  };
}

export const TaskSchema = SchemaFactory.createForClass(Task);
