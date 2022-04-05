import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Model } from 'mongoose';
import { ProjectDto } from './dto/project.dto';
import mongoose from 'mongoose';
import { partialUpdate } from 'src/core/mongo-db/helper';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { ProjectTaskDto } from 'src/project-tasks/dto/project-task.dto';
import { CreateProjectTaskDto } from 'src/project-tasks/dto/create-project-task.dto';
import { UpdateProjectTaskDto } from 'src/project-tasks/dto/update-project-task.dto';
import { CreateProjectMemberDto } from 'src/project-members/dtos/create-project-member.dto';
import { ProjectMemberDto } from 'src/project-members/dtos/project-member.dto';
import { ProjectRole } from 'src/core/enums/project-role.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  findAll() {
    return this.projectModel.find({}).exec();
  }

  async findOne(id: string): Promise<ProjectDto> {
    const project = await this.projectModel.findById(id).exec();

    const dto = project.toDto();

    return dto;
  }

  async findTask(id: string, taskId: string): Promise<ProjectTaskDto> {
    const project = await this.projectModel.findById(id).exec();
    const task = project.tasks.find(t => t._id.toString() === taskId);

    const dto = task.toDto();

    return dto;
  }

  async createTask(id: string, createProjectTaskDto: CreateProjectTaskDto): Promise<ProjectTaskDto> {
    const objId = new mongoose.Types.ObjectId();

    const filter = { _id: id };
    const update = { $addToSet: { tasks: { ...createProjectTaskDto, _id: objId } } };
    const options = { new: true };

    const project = await this.projectModel.findOneAndUpdate(filter, update, options).exec();

    if (!project) throw new NotFoundException('Project not found');

    const task = project.tasks.find(t => t._id.toString() === objId.toString());

    const dto = task.toDto();

    return dto;
  }

  async updateTask(id: string, taskId: string, updateProjectTaskDto: UpdateProjectTaskDto): Promise<ProjectTaskDto> {
    const partial = partialUpdate('tasks', updateProjectTaskDto);

    const filter = { _id: id, 'tasks._id': taskId };
    const update = { $set: partial };
    const options = { new: true };

    const updatedProject = await this.projectModel.findOneAndUpdate(filter, update, options).exec();

    if (!updatedProject) throw new NotFoundException('Project not found');

    const task = updatedProject.tasks.find(t => t._id.toString() === taskId);

    const dto = task.toDto();

    return dto;
  }

  async deleteTask(id: string, taskId: string): Promise<string> {
    const deleted = await this.projectModel
      .findByIdAndUpdate(id, { $pull: { tasks: { _id: taskId } } }, { new: true })
      .exec();

    return deleted._id;
  }

  async listTasks(id: string): Promise<ProjectTaskDto[]> {
    const project = await this.projectModel.findById(id).exec();
    const tasks = project.tasks;

    return tasks.map(t => {
      return {
        id: t._id.toString(),
        title: t.title,
        completed: t.completed,
        tag: t.tag,
        description: t.description,
      } as ProjectTaskDto;
    });
  }

  async inviteUser(
    id: string,
    userEmail: string,
    createProjectUserDto: CreateProjectMemberDto
  ): Promise<ProjectMemberDto> {
    const user: User = await this.userModel.findOne({ email: userEmail }).exec();

    if (!user) throw new NotFoundException('User not found');
    if (!createProjectUserDto.role) throw new BadRequestException('Role cannot be null!');

    const foundUser = await this.projectModel.findOne({ _id: id, 'members.user': user._id }).exec();
    if (foundUser) throw new ConflictException('User already invited!');

    const filter = { _id: id };
    const update = { $push: { members: { accepted: false, role: createProjectUserDto.role, user } } };
    const options = { new: true };

    const project = await this.projectModel.findOneAndUpdate(filter, update, options).exec();

    if (!project) throw new NotFoundException('Project not found');

    const dto = {
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company,
      accepted: false,
      role: createProjectUserDto.role,
    } as ProjectMemberDto;

    return dto;
  }

  async uninviteUser(id: string, userId: string): Promise<string> {
    return '1';
  }

  async listInvitedUsers(id: string): Promise<ProjectMemberDto[]> {
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
