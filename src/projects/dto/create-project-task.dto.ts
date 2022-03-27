import { TaskTag } from 'src/core/enums/task-tag.enum';

export class CreateProjectTaskDto {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  tag: TaskTag;
}
