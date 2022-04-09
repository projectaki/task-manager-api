import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ProjectRole } from './../../core/enums/project-role.enum';
import { Project } from './../../projects/schemas/project.schema';

export type UserProjectDocument = UserProject & Document;

@Schema({ versionKey: false, timestamps: true, _id: false })
export class UserProject {
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  accepted: boolean;

  @Prop({ enum: ProjectRole })
  role: ProjectRole;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Project.name })
  project: Project | mongoose.Types.ObjectId;
}

export const UserProjectSchema = SchemaFactory.createForClass(UserProject);
