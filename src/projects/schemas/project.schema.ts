import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProjectDto } from '../dto/project.dto';
import { ProjectMember } from '../../project-members/schemas/project-member.schema';
import { ProjectTask } from 'src/project-tasks/schemas/project-task.schema';

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

  @Prop([ProjectMember])
  members: ProjectMember[];

  @Prop([ProjectTask])
  tasks: ProjectTask[];

  toDto = (): ProjectDto =>
    ({
      id: this._id,
      name: this.title,
      members: this.members,
    } as ProjectDto);
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
