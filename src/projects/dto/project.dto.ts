import { ProjectUser } from '../schemas/project-user.schema';

export class ProjectDto {
  id: string;
  name: string;
  members: ProjectUser[];
}
