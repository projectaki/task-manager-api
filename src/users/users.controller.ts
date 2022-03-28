import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { CreateUserProjectDto } from './dto/create-user-project.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProjectDto } from './dto/update-user-project.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Patch(':userId')
  async update(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    return this.usersService.remove(userId);
  }

  @Post(':userId/projects')
  async createProject(@Param('userId') userId: string, @Body() createUserProjectDto: CreateUserProjectDto) {
    return this.usersService.createProject(userId, createUserProjectDto);
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
        { _id: '1', name: 'Project 1' },
        { _id: '2', name: 'Project 2' },
        { _id: '3', name: 'Project 3' },
      ])
    );
  }

  // @Get('listParticipantProjects')
  // listParticipantProjects(): Promise<CreateUserProjectDto[]> {
  //   const currentUserId = 'random';
  //   return lastValueFrom(
  //     of([
  //       { id: '4', name: 'Project 4' },
  //       { id: '5', name: 'Project 5' },
  //     ])
  //   );
  // }

  // @Get('listClientProjects')
  // listClientProjects(): Promise<CreateUserProjectDto[]> {
  //   const currentUserId = 'random';
  //   return lastValueFrom(
  //     of([
  //       { id: '6', name: 'Project 6' },
  //       { id: '7', name: 'Project 7' },
  //     ])
  //   );
  // }
}
