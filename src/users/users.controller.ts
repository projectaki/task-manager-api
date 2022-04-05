import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserProjectDto } from '../user-projects/dtos/create-user-project.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ProjectListItemDto } from '../projects/dto/project-list-item.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UpdateUserProjectDto } from 'src/user-projects/dtos/update-user-project.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Patch(':userId')
  update(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  delete(@Param('userId') userId: string): Promise<string> {
    return this.usersService.remove(userId);
  }

  @Post(':userId/projects')
  createProject(
    @Param('userId') userId: string,
    @Body() createUserProjectDto: CreateUserProjectDto
  ): Promise<ProjectListItemDto> {
    return this.usersService.createProject(userId, createUserProjectDto);
  }

  @Patch(':userId/projects/:projectId')
  updateProject(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() updateUserProjectDto: UpdateUserProjectDto
  ): Promise<ProjectListItemDto> {
    return this.usersService.updateProject(userId, projectId, updateUserProjectDto);
  }

  @Delete(':userId/projects/:projectId')
  deleteProject(@Param('userId') userId: string, @Param('projectId') projectId: string): Promise<string> {
    return this.usersService.deleteProject(userId, projectId);
  }

  @Get(':userId/listOwnedProjects')
  listOwnedProjects(@Param('userId') userId: string): Promise<ProjectListItemDto[]> {
    return this.usersService.listOwnedProjects(userId);
  }

  @Get(':userId/listParticipantProjects')
  listParticipantProjects(@Param('userId') userId: string): Promise<ProjectListItemDto[]> {
    return this.usersService.listParticipantProjects(userId);
  }

  @Get(':userId/listClientProjects')
  listClientProjects(@Param('userId') userId: string): Promise<ProjectListItemDto[]> {
    return this.usersService.listClientProjects(userId);
  }

  @Get(':userId/listPendingProjects')
  listPendingProjects(@Param('userId') userId: string): Promise<ProjectListItemDto[]> {
    return this.usersService.listPendingProjects(userId);
  }
}
