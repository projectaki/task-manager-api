import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { ProjectRole } from 'src/core/enums/project-role.enum';
import { ProjectMemberDto } from 'src/project-members/dtos/project-member.dto';
import { CreateProjectTaskDto } from 'src/project-tasks/dto/create-project-task.dto';
import { ProjectTaskDto } from 'src/project-tasks/dto/project-task.dto';
import { UpdateProjectTaskDto } from 'src/project-tasks/dto/update-project-task.dto';
import { User } from 'src/users/schemas/user.schema';
import { CreateProjectMemberDto } from '../project-members/dtos/create-project-member.dto';
import { ProjectDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user): Promise<ProjectDto> {
    const project = await this.projectsService.findOne(id);
    if (!project.members.find(m => m.user === user.sub)) {
      throw new ForbiddenException('You are not allowed to access this project');
    }
    return project;
  }

  @Get('/:id/tasks/:taskId')
  async findTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user
  ): Promise<ProjectTaskDto> {
    const project = await this.projectsService.findOne(id);
    if (!project.members.find(m => m.user === user.sub)) {
      throw new ForbiddenException('You are not allowed to access this task on this project');
    }
    return this.projectsService.findTask(id, taskId);
  }

  @Post('/:id/tasks')
  async createTask(
    @Param('id') id: string,
    @Body() createProjectTaskDto: CreateProjectTaskDto,
    @CurrentUser() user
  ): Promise<ProjectTaskDto> {
    const project = await this.projectsService.findOne(id);
    if (!project.members.find(m => m.user === user.sub && m.role === (ProjectRole.OWNER || ProjectRole.CLIENT))) {
      throw new ForbiddenException('You are not allowed to create a task on this project');
    }
    return this.projectsService.createTask(id, createProjectTaskDto);
  }

  @Patch('/:id/tasks/:taskId')
  async updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() updateProjectTaskDto: UpdateProjectTaskDto,
    @CurrentUser() user
  ): Promise<ProjectTaskDto> {
    const project = await this.projectsService.findOne(id);
    if (!project.members.find(m => m.user === user.sub && m.role === (ProjectRole.OWNER || ProjectRole.CLIENT))) {
      throw new ForbiddenException('You are not allowed to update tasks on this project');
    }
    return this.projectsService.updateTask(id, taskId, updateProjectTaskDto);
  }

  @Delete('/:id/tasks/:taskId')
  async deleteTask(@Param('id') id: string, @Param('taskId') taskId: string, @CurrentUser() user): Promise<string> {
    const project = await this.projectsService.findOne(id);
    if (!project.members.find(m => m.user === user.sub && m.role === ProjectRole.OWNER)) {
      throw new ForbiddenException('You are not allowed to delete tasks on this project');
    }
    return this.projectsService.deleteTask(id, taskId);
  }

  @Get(':id/tasks')
  async listTasks(@Param('id') id: string, @CurrentUser() user): Promise<ProjectTaskDto[]> {
    const project = await this.projectsService.findOne(id);
    if (!project.members.find(m => m.user === user.sub)) {
      throw new ForbiddenException('You are not allowed to see the tasks on this project');
    }
    return this.projectsService.listTasks(id);
  }

  @Post(':id/members/:userEmail')
  async inviteUser(
    @Param('id') id: string,
    @Param('userEmail') userEmail: string,
    @Body() createProjectUserDto: CreateProjectMemberDto,
    @CurrentUser() user
  ) {
    if (user.email === userEmail) {
      throw new ConflictException('You cannot invite yourself to a project');
    }

    const project = await this.projectsService.findOne(id);

    if (!project.members.find(m => m.user === user.sub && m.role === ProjectRole.OWNER)) {
      throw new ForbiddenException('You are not allowed to invite users to this project');
    }
    return this.projectsService.inviteUser(id, userEmail, createProjectUserDto);
  }

  @Delete(':id/members/:userId')
  async uninviteUser(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user) {
    const project = await this.projectsService.findOne(id);
    if (!project.members.find(m => m.user === user.sub && m.role === ProjectRole.OWNER)) {
      throw new ForbiddenException('You are not allowed to uninvite users from this project');
    }
    if (!project.members.find(m => m.user === userId)) {
      throw new ConflictException('User is not part of this project');
    }
    if (project.members.find(m => m.user === userId && m.role === ProjectRole.OWNER)) {
      throw new ForbiddenException('You are not allowed to uninvite an owner from a project');
    }
    return this.projectsService.uninviteUser(id, userId);
  }

  @Get(':id/members/listInvitedUsers')
  async listInvitedUsers(@Param('id') id: string, @CurrentUser() user): Promise<ProjectMemberDto[]> {
    const project = await this.projectsService.findOne(id);
    if (!project.members.find(m => m.user === user.sub)) {
      throw new ForbiddenException('You are not allowed to see the users for this project');
    }
    return this.projectsService.listProjectMembers(id);
  }
}
