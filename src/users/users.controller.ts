import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserProjectDto } from '../user-projects/dtos/create-user-project.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ProjectListItemDto } from '../projects/dto/project-list-item.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UpdateUserProjectDto } from 'src/user-projects/dtos/update-user-project.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { ProjectRole } from 'src/core/enums/project-role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user): Promise<User> {
    if (createUserDto._id !== user.sub)
      throw new ForbiddenException("You can't create a user with a different id than your own");
    return this.usersService.create(createUserDto);
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string, @CurrentUser() user): Promise<User> {
    if (userId !== user.sub) throw new ForbiddenException("You can't get a user with a different id than your own");
    return this.usersService.findOne(userId);
  }

  @Get()
  findAll(@CurrentUser() user): Promise<User[]> {
    if (user.role !== 'admin') throw new ForbiddenException("You can't get all users");
    return this.usersService.findAll();
  }

  @Patch(':userId')
  update(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user): Promise<User> {
    if (userId !== user.sub) throw new ForbiddenException("You can't update a user with a different id than your own");
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  delete(@Param('userId') userId: string, @CurrentUser() user): Promise<string> {
    if (user.role !== 'admin') throw new ForbiddenException("You can't delete a user");
    return this.usersService.remove(userId);
  }

  @Post(':userId/projects')
  createProject(
    @Param('userId') userId: string,
    @Body() createUserProjectDto: CreateUserProjectDto,
    @CurrentUser() user
  ): Promise<ProjectListItemDto> {
    if (userId !== user.sub)
      throw new ForbiddenException("You can't create a project for a user with a different id than your own");
    return this.usersService.createProject(userId, createUserProjectDto);
  }

  @Patch(':userId/projects/:projectId')
  async updateProject(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() updateUserProjectDto: UpdateUserProjectDto,
    @CurrentUser() user
  ): Promise<ProjectListItemDto> {
    if (userId !== user.sub)
      throw new ForbiddenException("You can't update a project for a user with a different id than your own");
    const resource = await this.usersService.findOne(userId);
    console.log(resource);
    if (
      !resource.projects.find(
        x => x.project.toString() === projectId && (x.role === ProjectRole.OWNER || x.role === ProjectRole.CLIENT)
      )
    ) {
      throw new ForbiddenException("You can't update a project you don't own");
    }

    return this.usersService.updateProject(userId, projectId, updateUserProjectDto);
  }

  @Delete(':userId/projects/:projectId')
  async deleteProject(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user
  ): Promise<string> {
    if (userId !== user.sub)
      throw new ForbiddenException("You can't delete a project for a user with a different id than your own");
    const resource = await this.usersService.findOne(userId);
    if (!resource.projects.find(x => x.project.toString() === projectId && x.role === ProjectRole.OWNER)) {
      throw new ForbiddenException("You can't delete a project you don't own");
    }
    return this.usersService.deleteProject(userId, projectId);
  }

  @Get(':userId/listOwnedProjects')
  listOwnedProjects(@Param('userId') userId: string, @CurrentUser() user): Promise<ProjectListItemDto[]> {
    if (userId !== user.sub)
      throw new ForbiddenException("You can't list owned projects for a user with a different id than your own");
    return this.usersService.listOwnedProjects(userId);
  }

  @Get(':userId/listParticipantProjects')
  listParticipantProjects(@Param('userId') userId: string, @CurrentUser() user): Promise<ProjectListItemDto[]> {
    if (userId !== user.sub)
      throw new ForbiddenException("You can't list participant projects for a user with a different id than your own");
    return this.usersService.listParticipantProjects(userId);
  }

  @Get(':userId/listClientProjects')
  listClientProjects(@Param('userId') userId: string, @CurrentUser() user): Promise<ProjectListItemDto[]> {
    if (userId !== user.sub)
      throw new ForbiddenException("You can't list client projects for a user with a different id than your own");
    return this.usersService.listClientProjects(userId);
  }

  @Get(':userId/listPendingProjects')
  listPendingProjects(@Param('userId') userId: string, @CurrentUser() user): Promise<ProjectListItemDto[]> {
    if (userId !== user.sub)
      throw new ForbiddenException("You can't list pending projects for a user with a different id than your own");
    return this.usersService.listPendingProjects(userId);
  }
}
