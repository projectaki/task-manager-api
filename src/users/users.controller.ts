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
    return createUserDto;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return {
      id,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return { ...updateUserDto, id };
  }

  @Post(':userId/projects')
  createProject(@Body() createUserProjectDto: CreateUserProjectDto) {
    return createUserProjectDto;
  }

  @Patch(':userId/projects/:projectId')
  updateProject(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() updateUserProjectDto: UpdateUserProjectDto
  ) {
    return { ...updateUserProjectDto, id: userId };
  }

  @Delete(':userId/projects/:projectId')
  deleteProject(@Param('userId') userId: string, @Param('projectId') projectId: string) {
    return { userId, projectId };
  }

  @Get(':userId/projects/listOwnedProjects')
  listOwnedProjects(@Param('userId') userId: string): Promise<CreateUserProjectDto[]> {
    return lastValueFrom(
      of([
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' },
        { id: '3', name: 'Project 3' },
      ])
    );
  }

  @Get(':userId/projects/listParticipantProjects')
  listParticipantProjects(@Param('userId') userId: string): Promise<CreateUserProjectDto[]> {
    return lastValueFrom(
      of([
        { id: '4', name: 'Project 4' },
        { id: '5', name: 'Project 5' },
      ])
    );
  }

  @Get(':userId/projects/listClientProjects')
  listClientProjects(@Param('userId') userId: string): Promise<CreateUserProjectDto[]> {
    return lastValueFrom(
      of([
        { id: '6', name: 'Project 6' },
        { id: '7', name: 'Project 7' },
      ])
    );
  }
}
