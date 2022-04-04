import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { ProjectDto } from '../dto/project.dto';
import { ProjectUser } from './project-user.schema';
import { Task } from './task.schema';

export type ProjectDocument = Project & Document;

@Schema({ versionKey: false, timestamps: true })
export class Project {
  _id: string;

  @Prop()
  title: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop([ProjectUser])
  members: ProjectUser[];

  @Prop([Task])
  tasks: Task[];

  toDto = (): ProjectDto =>
    ({
      id: this._id,
      name: this.title,
      members: this.members,
    } as ProjectDto);
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
