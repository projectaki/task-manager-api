import { TaskTag } from 'src/core/enums/task-tag.enum';

export class TaskDto {
  id: string;
  title: string;
  completed: boolean;
  tag: TaskTag;
  description?: string;
}
