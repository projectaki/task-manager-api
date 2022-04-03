import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { ProjectDto } from '../dto/project.dto';
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

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  owners: User[] | string[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  participants: User[] | string[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  clients: User[] | string[];

  @Prop([Task])
  tasks: Task[];

  toDto = (): ProjectDto =>
    ({
      id: this._id,
      name: this.title,
      ownerIds: this.owners,
      participantIds: this.participants,
      clientIds: this.clients,
    } as ProjectDto);
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
