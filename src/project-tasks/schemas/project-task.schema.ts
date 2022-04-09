import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { TaskTag } from './../../core/enums/task-tag.enum';
import { ProjectTaskDto } from '../dto/project-task.dto';

export type ProjectTaskDocument = ProjectTask & Document;

@Schema({ versionKey: false, timestamps: true })
export class ProjectTask {
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

  toDto(): ProjectTaskDto {
    return {
      id: this._id.toString(),
      title: this.title,
      description: this.description,
      completed: this.completed,
      tag: this.tag,
    } as ProjectTaskDto;
  }
}

export const ProjectTaskSchema = SchemaFactory.createForClass(ProjectTask);
