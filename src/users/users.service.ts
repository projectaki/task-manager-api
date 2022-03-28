import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Project, ProjectDocument } from 'src/projects/schemas/project.schema';
import { CreateUserProjectDto } from './dto/create-user-project.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
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
}
