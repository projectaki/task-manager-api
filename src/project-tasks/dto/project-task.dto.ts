import { TaskTag } from 'src/core/enums/task-tag.enum';

export class ProjectTaskDto {
  id: string;
  title: string;
  completed: boolean;
  tag: TaskTag;
  description?: string;
}
