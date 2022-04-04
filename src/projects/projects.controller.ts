import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProjectRole } from 'src/core/enums/project-role.enum';
import { TaskTag } from 'src/core/enums/task-tag.enum';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { ProjectDto } from './dto/project.dto';
import { TaskDto } from './dto/task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';
import { UserDto } from './dto/user.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProjectDto> {
    return this.projectsService.findOne(id);
  }

  @Get('/:id/tasks/:taskId')
  findTask(@Param('id') id: string, @Param('taskId') taskId: string): Promise<TaskDto> {
    return this.projectsService.findTask(id, taskId);
  }

  @Post('/:id/tasks')
  createTask(@Param('id') id: string, @Body() createProjectTaskDto: CreateProjectTaskDto): Promise<TaskDto> {
    return this.projectsService.createTask(id, createProjectTaskDto);
  }

  @Patch('/:id/tasks/:taskId')
  updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() updateProjectTaskDto: UpdateProjectTaskDto
  ): Promise<TaskDto> {
    return this.projectsService.updateTask(id, taskId, updateProjectTaskDto);
  }

  @Delete('/:id/tasks/:taskId')
  deleteTask(@Param('id') id: string, @Param('taskId') taskId: string): Promise<string> {
    return this.projectsService.deleteTask(id, taskId);
  }

  @Get(':id/tasks')
  listTasks(@Param('id') id: string): Promise<TaskDto[]> {
    return this.projectsService.listTasks(id);
  }
  //////////////////////////////////////////////////////////////////////////////
  @Post(':id/members/:userEmail')
  inviteUser(
    @Param('id') id: string,
    @Param('userEmail') userEmail: string,
    @Body() createProjectUserDto: CreateProjectUserDto
  ) {
    return this.projectsService.inviteUser(id, userEmail, createProjectUserDto);
  }

  @Delete(':id/members/:userId')
  uninviteUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.projectsService.uninviteUser(id, userId);
  }

  @Get(':id/members/listInvitedUsers')
  listInvitedUsers(@Param('id') id: string): Promise<UserDto[]> {
    return this.projectsService.listInvitedUsers(id);
  }
}
