import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Project, ProjectDocument } from 'src/projects/schemas/project.schema';
import { CreateUserProjectDto } from '../user-projects/dtos/create-user-project.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ProjectListItemDto } from '../projects/dto/project-list-item.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserProjectDto } from 'src/user-projects/dtos/update-user-project.dto';
import { ProjectRole } from 'src/core/enums/project-role.enum';
import { UserProject } from 'src/user-projects/schemas/user-project.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  findAll(): Promise<User[]> {
    return this.userModel.find({}).exec();
  }

  findOne(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate({ _id: id }, updateUserDto, { new: true }).exec();
  }

  async remove(id: string): Promise<string> {
    const deleted = await this.userModel.findByIdAndRemove({ _id: id }).exec();
    return deleted._id;
  }

  /**
   * Transaction is needed here for ACIDIC operation adding the project with user, and user with project.
   * A two-way reference is necessary here as we want to query projects as subdocuments of users,
   * aswell as query users as subdocuments of projects.
   */
  async createProject(userId: string, createUserProjectDto: CreateUserProjectDto): Promise<ProjectListItemDto> {
    const session = await this.connection.startSession();
    const project = new this.projectModel({
      ...createUserProjectDto,
      members: {
        user: userId,
        accepted: true,
        role: ProjectRole.OWNER,
      },
    });

    await session
      .withTransaction(async () => {
        await project.save({ session });
        const filter = { _id: userId };
        const update = {
          $push: {
            projects: {
              project: project._id,
              role: ProjectRole.OWNER,
              accepted: true,
            } as UserProject,
          },
        };
        const options = { new: true, session };

        const user = await this.userModel.findOneAndUpdate(filter, update, options).session(session).exec();
        if (!user) throw new NotFoundException('User not found');
        return user;
      })
      .catch(err => {
        if (err instanceof NotFoundException) throw new NotFoundException(err.message);
        throw new InternalServerErrorException(err.message);
      });

    await session.endSession();

    return {
      id: project._id,
      title: project.title,
    } as ProjectListItemDto;
  }

  async updateProject(
    userId: string,
    projectId: string,
    updateUserProjectDto: UpdateUserProjectDto
  ): Promise<ProjectListItemDto> {
    const updated = await this.projectModel
      .findOneAndUpdate({ _id: projectId }, updateUserProjectDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Project not found');

    return {
      id: updated._id,
      title: updated.title,
    } as ProjectListItemDto;
  }

  async deleteProject(userId: string, projectId: string): Promise<string> {
    const session = await this.connection.startSession();
    await session
      .withTransaction(async () => {
        const deleted = await this.projectModel.findOneAndRemove({ _id: projectId }).session(session).exec();
        if (!deleted) throw new NotFoundException('Project not found');
        const user = await this.userModel
          .findOneAndUpdate({ _id: userId }, { $pull: { 'projects.project': projectId } }, { new: true })
          .session(session)
          .exec();
        if (!user) throw new NotFoundException('User not found');
        return user;
      })
      .catch(err => {
        throw new NotFoundException(err.message);
      });
    await session.endSession();

    return projectId;
  }

  async listOwnedProjects(userId: string): Promise<ProjectListItemDto[]> {
    const user = await this.userModel.findById(userId).populate('projects').exec();

    return user.projects
      .filter(x => x.role === ProjectRole.OWNER)
      .map(x => {
        const project: Project = <Project>x.project;
        return {
          id: project._id,
          title: project.title,
        } as ProjectListItemDto;
      });
  }

  async listParticipantProjects(userId: string): Promise<ProjectListItemDto[]> {
    const user = await this.userModel.findById(userId).populate('projects').exec();

    return user.projects
      .filter(x => x.role === ProjectRole.PARTICIPANT)
      .map(x => {
        const project: Project = <Project>x.project;
        return {
          id: project._id,
          title: project.title,
        } as ProjectListItemDto;
      });
  }

  async listClientProjects(userId: string): Promise<ProjectListItemDto[]> {
    const user = await this.userModel.findById(userId).populate('projects').exec();

    return user.projects
      .filter(x => x.role === ProjectRole.CLIENT)
      .map(x => {
        const project: Project = <Project>x.project;
        return {
          id: project._id,
          title: project.title,
        } as ProjectListItemDto;
      });
  }
}
