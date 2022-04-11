import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProjectDto } from '../dto/project.dto';
import { ProjectMember } from '../../project-members/schemas/project-member.schema';
import { ProjectTask } from 'src/project-tasks/schemas/project-task.schema';
import mongoose from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ versionKey: false, timestamps: true })
export class Project {
  _id: mongoose.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop([ProjectMember])
  members: ProjectMember[];

  @Prop([ProjectTask])
  tasks: ProjectTask[];

  static toDto(project: Project): ProjectDto {
    return { id: project._id.toString(), name: project.title, members: project.members } as ProjectDto;
  }
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
