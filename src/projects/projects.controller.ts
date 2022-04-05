import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProjectMemberDto } from 'src/project-members/dtos/project-member.dto';
import { CreateProjectTaskDto } from 'src/project-tasks/dto/create-project-task.dto';
import { ProjectTaskDto } from 'src/project-tasks/dto/project-task.dto';
import { UpdateProjectTaskDto } from 'src/project-tasks/dto/update-project-task.dto';
import { CreateProjectMemberDto } from '../project-members/dtos/create-project-member.dto';
import { ProjectDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProjectDto> {
    return this.projectsService.findOne(id);
  }

  @Get('/:id/tasks/:taskId')
  findTask(@Param('id') id: string, @Param('taskId') taskId: string): Promise<ProjectTaskDto> {
    return this.projectsService.findTask(id, taskId);
  }

  @Post('/:id/tasks')
  createTask(@Param('id') id: string, @Body() createProjectTaskDto: CreateProjectTaskDto): Promise<ProjectTaskDto> {
    return this.projectsService.createTask(id, createProjectTaskDto);
  }

  @Patch('/:id/tasks/:taskId')
  updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() updateProjectTaskDto: UpdateProjectTaskDto
  ): Promise<ProjectTaskDto> {
    return this.projectsService.updateTask(id, taskId, updateProjectTaskDto);
  }

  @Delete('/:id/tasks/:taskId')
  deleteTask(@Param('id') id: string, @Param('taskId') taskId: string): Promise<string> {
    return this.projectsService.deleteTask(id, taskId);
  }

  @Get(':id/tasks')
  listTasks(@Param('id') id: string): Promise<ProjectTaskDto[]> {
    return this.projectsService.listTasks(id);
  }

  @Post(':id/members/:userEmail')
  inviteUser(
    @Param('id') id: string,
    @Param('userEmail') userEmail: string,
    @Body() createProjectUserDto: CreateProjectMemberDto
  ) {
    return this.projectsService.inviteUser(id, userEmail, createProjectUserDto);
  }

  @Delete(':id/members/:userId')
  uninviteUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.projectsService.uninviteUser(id, userId);
  }

  @Get(':id/members/listInvitedUsers')
  listInvitedUsers(@Param('id') id: string): Promise<ProjectMemberDto[]> {
    return this.projectsService.listProjectMembers(id);
  }
}
