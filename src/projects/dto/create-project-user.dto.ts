import { ProjectRole } from 'src/core/enums/project-role.enum';

export class CreateProjectUserDto {
  id: string;
  email: string;
  role: ProjectRole;
  projectId: string;
}
