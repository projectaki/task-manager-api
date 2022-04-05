import { ProjectMember } from '../../project-members/schemas/project-member.schema';

export class ProjectDto {
  id: string;
  name: string;
  members: ProjectMember[];
}
