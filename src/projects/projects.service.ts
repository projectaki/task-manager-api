import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Model } from 'mongoose';
import { ProjectDto } from './dto/project.dto';
import { TaskDto } from './dto/task.dto';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';

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
            'tasks.$.title': updateProjectTaskDto.title,
            'tasks.$.description': updateProjectTaskDto.description,
            'tasks.$.completed': updateProjectTaskDto.completed,
            'tasks.$.tag': updateProjectTaskDto.tag,
          },
        },
        { new: true }
      )
      .exec();
    if (!updatedProject) throw new NotFoundException('Project not found');

    return null;
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
}
