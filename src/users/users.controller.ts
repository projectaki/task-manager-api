import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { CreateUserProjectDto } from './dto/create-user-project.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProjectDto } from './dto/update-user-project.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    const currentUserId = 'random';
    return createUserDto;
  }

  @Get()
  findOne() {
    const currentUserId = 'random';
    return {
      id: 'random',
    };
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    const currentUserId = 'random';
    return { ...updateUserDto };
  }

  @Post('projects')
  createProject(@Body() createUserProjectDto: CreateUserProjectDto) {
    const currentUserId = 'random';
    return createUserProjectDto;
  }

  @Patch('projects/:projectId')
  updateProject(@Param('projectId') projectId: string, @Body() updateUserProjectDto: UpdateUserProjectDto) {
    const currentUserId = 'random';
    return { ...updateUserProjectDto };
  }

  @Delete('projects/:projectId')
  deleteProject(@Param('projectId') projectId: string) {
    const currentUserId = 'random';
    return { projectId };
  }

  @Get('listOwnedProjects')
  listOwnedProjects(): Promise<CreateUserProjectDto[]> {
    const currentUserId = 'random';
    return lastValueFrom(
      of([
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' },
        { id: '3', name: 'Project 3' },
      ])
    );
  }

  @Get('listParticipantProjects')
  listParticipantProjects(): Promise<CreateUserProjectDto[]> {
    const currentUserId = 'random';
    return lastValueFrom(
      of([
        { id: '4', name: 'Project 4' },
        { id: '5', name: 'Project 5' },
      ])
    );
  }

  @Get('listClientProjects')
  listClientProjects(): Promise<CreateUserProjectDto[]> {
    const currentUserId = 'random';
    return lastValueFrom(
      of([
        { id: '6', name: 'Project 6' },
        { id: '7', name: 'Project 7' },
      ])
    );
  }
}
