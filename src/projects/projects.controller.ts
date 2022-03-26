import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';
import { UpdateProjectUserDto } from './dto/update-project-user.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    {
      id;
    }
  }
  @Post('/:id/tasks')
  createTask(@Param('id') id: string, @Body() createProjectTaskDto: CreateProjectTaskDto) {
    return { ...createProjectTaskDto, id };
  }

  @Patch('/:id/tasks/:taskId')
  updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() updateProjectTaskDto: UpdateProjectTaskDto
  ) {
    return { ...updateProjectTaskDto, id };
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return id;
  }

  @Get(':id/tasks/listTasks')
  listTasks(@Param('id') id: string) {
    return [id];
  }

  @Post(':id/users')
  inviteUser(@Param('id') id: string, @Body() createProjectUserDto: CreateProjectUserDto) {
    return { ...createProjectUserDto, id };
  }

  @Delete(':id/users/:userId')
  uninviteUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateProjectUserDto: UpdateProjectUserDto
  ) {
    return { ...updateProjectUserDto, id };
  }

  @Get(':id/users/listInvitedUsers')
  listInvitedUsers(@Param('id') id: string) {
    return [id];
  }
}
