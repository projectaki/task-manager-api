import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Project, ProjectDocument } from './../projects/schemas/project.schema';
import { CreateUserProjectDto } from '../user-projects/dtos/create-user-project.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ProjectListItemDto } from '../projects/dto/project-list-item.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserProjectDto } from './../user-projects/dtos/update-user-project.dto';
import { ProjectRole } from './../core/enums/project-role.enum';
import { UserProject } from './../user-projects/schemas/user-project.schema';
import { Permission } from './../core/enums/permission.enum';
import { Role } from './../core/enums/role.enum';

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

  findOneByQuery(query: { email: string }): Promise<User> {
    return this.userModel.findOne(query).exec();
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate({ _id: id }, updateUserDto, { new: true }).exec();
  }

  async remove(id: string): Promise<string> {
    const deleted = await this.userModel.findByIdAndRemove({ _id: id }).exec();
    return deleted._id;
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    return [];
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    return [];
  }

  /**
   * Transaction is needed here for ACIDIC operation adding the project with user, and user with project.
   * A two-way reference is necessary here as we want to query projects as subdocuments of users,
   * aswell as query users as subdocuments of projects.
   */
  async createProject(userId: string, createUserProjectDto: CreateUserProjectDto): Promise<ProjectListItemDto> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const [project] = await this.projectModel.create(
        [
          {
            ...createUserProjectDto,
            members: {
              user: userId,
              accepted: true,
              role: ProjectRole.OWNER,
            },
          },
        ],
        { session }
      );

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
      await session.commitTransaction();

      return {
        id: project._id.toString(),
        title: project.title,
      } as ProjectListItemDto;
    } catch (err) {
      await session.abortTransaction();
      if (err instanceof NotFoundException) throw new NotFoundException(err.message);
      throw err;
    } finally {
      await session.endSession();
    }
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
      id: updated._id.toString(),
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
          .findOneAndUpdate({ _id: userId }, { $pull: { projects: { project: projectId } } }, { new: true })
          .session(session)
          .exec();
        if (!user) throw new NotFoundException('User not found');
        return user;
      })
      .catch(err => {
        if (err instanceof NotFoundException) throw new NotFoundException(err.message);
        throw new InternalServerErrorException(err.message);
      });

    await session.endSession();

    return projectId;
  }

  async listOwnedProjects(userId: string): Promise<ProjectListItemDto[]> {
    const user = await this.userModel.findById(userId).populate('projects.project').exec();
    return user.projects
      .filter(x => x.role === ProjectRole.OWNER)
      .map(x => {
        const project: Project = <Project>x.project;
        return {
          id: project._id.toString(),
          title: project.title,
        } as ProjectListItemDto;
      });
  }

  async listParticipantProjects(userId: string): Promise<ProjectListItemDto[]> {
    const user = await this.userModel.findById(userId).populate('projects.project').exec();

    return user.projects
      .filter(x => x.role === ProjectRole.PARTICIPANT)
      .map(x => {
        const project: Project = <Project>x.project;
        return {
          id: project._id.toString(),
          title: project.title,
        } as ProjectListItemDto;
      });
  }

  async listClientProjects(userId: string): Promise<ProjectListItemDto[]> {
    const user = await this.userModel.findById(userId).populate('projects.project').exec();

    return user.projects
      .filter(x => x.role === ProjectRole.CLIENT)
      .map(x => {
        const project: Project = <Project>x.project;
        return {
          id: project._id.toString(),
          title: project.title,
        } as ProjectListItemDto;
      });
  }

  async listPendingProjects(userId: string): Promise<ProjectListItemDto[]> {
    const user = await this.userModel.findById(userId).populate('projects.project').exec();

    return user.projects
      .filter(x => x.accepted === false)
      .map(x => {
        const project: Project = <Project>x.project;
        return {
          id: project._id.toString(),
          title: project.title,
        } as ProjectListItemDto;
      });
  }
}
