import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
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
import { ProjectTask } from 'src/project-tasks/schemas/project-task.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  findAll() {
    return this.projectModel.find({}).exec();
  }

  async findOne(id: string): Promise<ProjectDto> {
    const project = await this.projectModel.findById(id).exec();

    const dto = Project.toDto(project);

    return dto;
  }

  async findTask(id: string, taskId: string): Promise<ProjectTaskDto> {
    const project = await this.projectModel.findById(id).exec();
    const task = project.tasks.find(t => t._id.toString() === taskId);

    const dto = ProjectTask.toDto(task);

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

    const dto = ProjectTask.toDto(task);

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

    const dto = ProjectTask.toDto(task);

    return dto;
  }

  async deleteTask(id: string, taskId: string): Promise<string> {
    const deleted = await this.projectModel
      .findByIdAndUpdate(id, { $pull: { tasks: { _id: taskId } } }, { new: true })
      .exec();

    if (!deleted) throw new NotFoundException('Project not found');

    return taskId;
  }

  async listTasks(id: string): Promise<ProjectTaskDto[]> {
    const project = await this.projectModel.findById(id).exec();
    const tasks = project.tasks;
    return tasks.map(t => ProjectTask.toDto(t));
  }

  async inviteUser(
    id: string,
    userEmail: string,
    createProjectUserDto: CreateProjectMemberDto
  ): Promise<ProjectMemberDto> {
    let user: User = new User();
    const session = await this.connection.startSession();
    await session
      .withTransaction(async () => {
        user = await this.userModel
          .findOneAndUpdate(
            { email: userEmail, 'projects.project': { $nin: id } },
            {
              $push: {
                projects: {
                  project: id,
                  role: createProjectUserDto.role,
                  accepted: false,
                },
              },
            },
            { new: true }
          )
          .session(session)
          .exec();

        if (!user) throw new NotFoundException("User is already invited or doesn't exist!");

        const filter = { _id: id };
        const update = {
          $push: { members: { user: user, role: createProjectUserDto.role, accepted: false } },
        };
        const options = { new: true };

        const project = await this.projectModel.findOneAndUpdate(filter, update, options).session(session).exec();

        if (!project) throw new ConflictException("Project doesn't exist!");
      })
      .catch(err => {
        if (err instanceof NotFoundException) throw new NotFoundException(err.message);
        throw new InternalServerErrorException(err.message);
      });

    await session.endSession();

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
    let user: User = new User();
    const session = await this.connection.startSession();
    await session
      .withTransaction(async () => {
        user = await this.userModel
          .findOneAndUpdate(
            { _id: userId, 'projects.project': { $in: id } },
            { $pull: { projects: { project: id } } },
            { new: true }
          )
          .session(session)
          .exec();

        if (!user) throw new NotFoundException("User is not part of the project or user doesn't exist!");

        const filter = { _id: id };
        const update = { $pull: { members: { user: userId } } };
        const options = { new: true };

        const project = await this.projectModel.findOneAndUpdate(filter, update, options).session(session).exec();

        if (!project) throw new NotFoundException("Project doesn't exist!");
      })
      .catch(err => {
        if (err instanceof NotFoundException) throw new NotFoundException(err.message);
        throw new InternalServerErrorException(err.message);
      });

    return user._id;
  }

  async listProjectMembers(id: string): Promise<ProjectMemberDto[]> {
    const project = await this.projectModel.findOne({ _id: id }).populate('members.user').exec();
    if (!project) throw new NotFoundException("Project doesn't exist!");

    const membersDtos = project.members.map(m => {
      const member = <User>m.user;
      return {
        id: member._id,
        name: member.name,
        email: member.email,
        company: member.company,
        accepted: m.accepted,
        role: m.role,
      } as ProjectMemberDto;
    });

    return membersDtos;
  }
}
