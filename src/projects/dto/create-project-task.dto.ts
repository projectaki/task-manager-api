import { TaskTag } from 'src/core/enums/task-tag.enum';

export class CreateProjectTaskDto {
  title: string;
  description: string;
  completed: boolean;
  tag: TaskTag;
}
