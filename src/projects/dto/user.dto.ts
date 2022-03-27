import { ProjectRole } from 'src/core/enums/project-role.enum';

export class UserDto {
  id: string;
  name: string;
  email: string;
  company: string;
  role: ProjectRole;
  accepted: boolean;
}
