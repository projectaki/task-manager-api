import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Project, ProjectDocument } from 'src/projects/schemas/project.schema';
import { CreateUserProjectDto } from './dto/create-user-project.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProjectDto } from './dto/update-user-project.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

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
    return this.userModel.findOne({ _id: id }).populate('ownedProjects').exec();
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate({ _id: id }, updateUserDto, { new: true }).exec();
  }

  remove(id: string): Promise<User> {
    return this.userModel.findByIdAndRemove({ _id: id }).exec();
  }

  /**
   * Transaction is needed here for ACIDIC operation adding the project with user, and user with project.
   * A two-way reference is necessary here as we want to query projects as subdocuments of users,
   * aswell as query users as subdocuments of projects.
   */
  async createProject(userId: string, createUserProjectDto: CreateUserProjectDto): Promise<Project> {
    const session = await this.connection.startSession();
    const project = new this.projectModel({ ...createUserProjectDto, owners: [userId] });

    await session
      .withTransaction(async () => {
        await project.save({ session });
        const user = await this.userModel
          .findByIdAndUpdate({ _id: userId }, { $addToSet: { ownedProjects: project } }, { new: true })
          .session(session)
          .exec();
        if (!user) throw new NotFoundException('User not found');
        return user;
      })
      .catch(err => {
        throw new NotFoundException(err.message);
      });
    await session.endSession();

    return project;
  }

  async updateProject(userId: string, projectId: string, updateUserProjectDto: UpdateUserProjectDto): Promise<Project> {
    const updated = await this.projectModel
      .findByIdAndUpdate({ _id: projectId }, updateUserProjectDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Project not found');

    return updated;
  }

  async deleteProject(userId: string, projectId: string): Promise<string> {
    const session = await this.connection.startSession();
    await session
      .withTransaction(async () => {
        const deleted = await this.projectModel.findByIdAndRemove({ _id: projectId }).session(session).exec();
        if (!deleted) throw new NotFoundException('Project not found');
        const user = await this.userModel
          .findByIdAndUpdate({ _id: userId }, { $pull: { ownedProjects: projectId } }, { new: true })
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

  async listOwnedProjects(userId: string): Promise<Project[]> {
    const user = await this.userModel.findById(userId).populate('ownedProjects').exec();

    return user.ownedProjects;
  }

  async listParticipantProjects(userId: string): Promise<Project[]> {
    const user = await this.userModel.findById(userId).populate('participantProjects').exec();

    return user.participantProjects;
  }

  async listClientProjects(userId: string): Promise<Project[]> {
    const user = await this.userModel.findById(userId).populate('clientProjects').exec();

    return user.clientProjects;
  }
}
