import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
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
  listOwnedProjects(@Param('userId') userId: string) {
    return [userId];
  }

  @Get(':userId/projects/listParticipantProjects')
  listParticipantProjects(@Param('userId') userId: string) {
    return [userId];
  }

  @Get(':userId/projects/listClientProjects')
  listClientProjects(@Param('userId') userId: string) {
    return [userId];
  }
}
