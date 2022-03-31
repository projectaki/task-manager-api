import { Injectable } from '@nestjs/common';
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
    return this.userModel.findOne({ _id: id }).exec();
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
  async createProject(userId: string, createUserProjectDto: CreateUserProjectDto): Promise<User> {
    let user;
    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      const project = new this.projectModel({ ...createUserProjectDto, owners: [userId] });
      await project.save({ session });
      user = await this.userModel
        .findByIdAndUpdate({ _id: userId }, { $addToSet: { ownedProjects: project } }, { new: true })
        .session(session)
        .exec();
      return user;
    });
    await session.endSession();

    return user;
  }

  async updateProject(userId: string, projectId: string, updateUserProjectDto: UpdateUserProjectDto): Promise<User> {
    await this.projectModel.findByIdAndUpdate({ _id: projectId }, updateUserProjectDto).exec();

    return await this.findOne(userId);
  }

  async deleteProject(userId: string, projectId: string): Promise<User> {
    let user;
    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      await this.projectModel.findByIdAndRemove({ _id: projectId }).session(session).exec();
      user = await this.userModel
        .findByIdAndUpdate({ _id: userId }, { $pull: { _id: projectId } }, { new: true })
        .session(session)
        .exec();
      return user;
    });
    await session.endSession();

    return user;
  }

  async listOwnedProjects(userId: string): Promise<CreateUserProjectDto[]> {
    const user = await this.userModel.findById(userId).populate('ownedProjects').exec();
    const projects: Project[] = user.ownedProjects;
    const projectDtos: CreateUserProjectDto[] = projects.map(project => ({
      _id: project._id,
      name: project.title,
    }));
    return projectDtos;
  }

  async listParticipantProjects(userId: string): Promise<CreateUserProjectDto[]> {
    const user = await this.userModel.findById(userId).populate('participantProjects').exec();
    const projects: Project[] = user.participantProjects;
    const projectDtos: CreateUserProjectDto[] = projects.map(project => ({
      _id: project._id,
      name: project.title,
    }));
    return projectDtos;
  }

  async listClientProjects(userId: string): Promise<CreateUserProjectDto[]> {
    const user = await this.userModel.findById(userId).populate('clientProjects').exec();
    const projects: Project[] = user.clientProjects;
    const projectDtos: CreateUserProjectDto[] = projects.map(project => ({
      _id: project._id,
      name: project.title,
    }));
    return projectDtos;
  }
}
