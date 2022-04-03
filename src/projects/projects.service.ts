import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Model } from 'mongoose';
import { ProjectDto } from './dto/project.dto';
import { TaskDto } from './dto/task.dto';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { UserDto } from './dto/user.dto';
import { ProjectRole } from 'src/core/enums/project-role.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>
  ) {}

  findAll() {
    return this.projectModel.find({}).exec();
  }

  async findOne(id: string): Promise<ProjectDto> {
    const project = await this.projectModel.findById(id).exec();
    const dto = {
      id: project._id,
      name: project.title,
      ownerIds: project.owners,
      participantIds: project.participants,
      clientIds: project.clients,
    } as ProjectDto;

    return dto;
  }

  async findTask(id: string, taskId: string): Promise<TaskDto> {
    const project = await this.projectModel.findById(id).exec();
    const task = project.tasks.find(t => t._id === taskId);

    return {
      id: task._id,
      title: task.title,
      completed: task.completed,
      tag: task.tag,
      description: task.description,
    } as TaskDto;
  }

  async createTask(id: string, createProjectTaskDto: CreateProjectTaskDto): Promise<TaskDto> {
    const task = new this.taskModel(createProjectTaskDto);
    const project = await this.projectModel.findByIdAndUpdate(id, { $addToSet: { tasks: task } }, { new: true }).exec();
    if (!project) throw new NotFoundException('Project not found');

    return {
      id: task._id,
      title: task.title,
      completed: task.completed,
      tag: task.tag,
      description: task.description,
    } as TaskDto;
  }

  async updateTask(id: string, taskId: string, updateProjectTaskDto: UpdateProjectTaskDto): Promise<TaskDto> {
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(
        { _id: id, 'tasks._id': taskId },
        {
          $set: {
            'tasks.$': updateProjectTaskDto,
          },
        },
        { new: true }
      )
      .exec();
    if (!updatedProject) throw new NotFoundException('Project not found');

    const task = updatedProject.tasks.find(t => t._id === taskId);

    return {
      id: task._id,
      title: task.title,
      completed: task.completed,
      tag: task.tag,
      description: task.description,
    } as TaskDto;
  }

  async deleteTask(id: string, taskId: string): Promise<string> {
    const deleted = await this.projectModel
      .findByIdAndUpdate(id, { $pull: { tasks: { _id: taskId } } }, { new: true })
      .exec();

    return deleted._id;
  }

  async listTasks(id: string): Promise<TaskDto[]> {
    const project = await this.projectModel.findById(id).exec();
    const tasks = project.tasks;

    return tasks.map(t => {
      return {
        id: t._id,
        title: t.title,
        completed: t.completed,
        tag: t.tag,
        description: t.description,
      } as TaskDto;
    });
  }

  async inviteUser(id: string, userId: string, createProjectUserDto: CreateProjectUserDto): Promise<UserDto> {
    return {
      id: '1',
      accepted: false,
      company: 'Test',
      email: createProjectUserDto.email,
      name: createProjectUserDto.email,
      role: createProjectUserDto.role,
    };
  }

  async uninviteUser(id: string, userId: string): Promise<string> {
    return '1';
  }

  async listInvitedUsers(id: string): Promise<UserDto[]> {
    return [
      {
        id: 'auth0|622e71a6d36bbb0069373531',
        name: 'Akos',
        email: 'a@a.com',
        company: 'HR',
        accepted: true,
        role: ProjectRole.OWNER,
      },
      {
        id: '2a',
        name: 'Marysia',
        email: 'a@a.com',
        company: 'JAPAN',
        accepted: false,
        role: ProjectRole.PARTICIPANT,
      },
      {
        id: '3a',
        name: 'Jeff',
        email: 'a@a.com',
        company: 'MY HOSUE',
        accepted: true,
        role: ProjectRole.CLIENT,
      },
    ];
  }
}
