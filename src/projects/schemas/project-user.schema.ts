import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ProjectRole } from 'src/core/enums/project-role.enum';
import { User } from 'src/users/schemas/user.schema';

export type ProjectUserDocument = ProjectUser & Document;

@Schema({ versionKey: false, timestamps: true, _id: false })
export class ProjectUser {
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  accepted: boolean;

  @Prop({ enum: ProjectRole })
  role: ProjectRole;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: User | string;
}

export const ProjectUserSchema = SchemaFactory.createForClass(ProjectUser);
