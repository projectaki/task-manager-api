import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ProjectRole } from 'src/core/enums/project-role.enum';
import { User } from 'src/users/schemas/user.schema';

export type ProjectMemberDocument = ProjectMember & Document;

@Schema({ versionKey: false, timestamps: true, _id: false })
export class ProjectMember {
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  accepted: boolean;

  @Prop({ enum: ProjectRole })
  role: ProjectRole;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User | string;
}

export const ProjectMemberSchema = SchemaFactory.createForClass(ProjectMember);
