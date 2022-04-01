import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
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
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
