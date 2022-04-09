import { NotFoundException } from '@nestjs/common';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserProjectDto } from 'src/user-projects/dtos/create-user-project.dto';
import { Project } from './../projects/schemas/project.schema';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const userModel: any = {
    findOneAndUpdate: jest.fn().mockImplementation((x: any, y: any, z: any) => ({
      session: jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(Promise.resolve({})),
      }),
    })),
  };
  const projectModel: any = {
    create: jest.fn().mockReturnValue([
      {
        _id: '1',
        title: 'test',
      },
    ]),
  };
  const conn: any = {
    startSession: jest.fn().mockReturnValue({
      startTransaction: jest.fn(),
      endSession: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
    }),
  };

  const userUpdateSpy = jest.spyOn(userModel, 'findOneAndUpdate');
  const projectSaveSpy = jest.spyOn(projectModel, 'create');
  const startSessionSpy = jest.spyOn(conn, 'startSession');
  const session = conn.startSession();
  const startTransSpy = jest.spyOn(session, 'startTransaction');
  const commitTransSpy = jest.spyOn(session, 'commitTransaction');
  const abortTransSpy = jest.spyOn(session, 'abortTransaction');
  const endSessionSpy = jest.spyOn(session, 'endSession');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: getModelToken(Project.name),
          useValue: projectModel,
        },
        {
          provide: getConnectionToken(),
          useValue: conn,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('creat project', () => {
    it('should create a project and assign user', async () => {
      const project = await service.createProject('1', {
        title: 'test',
      } as CreateUserProjectDto);
      expect(project).toBeDefined();
      expect(userUpdateSpy).toHaveBeenCalled();
      expect(projectSaveSpy).toHaveBeenCalled();
      expect(startSessionSpy).toHaveBeenCalledTimes(1);
      expect(startTransSpy).toHaveBeenCalledTimes(1);
      expect(commitTransSpy).toHaveBeenCalledTimes(1);
      expect(abortTransSpy).toHaveBeenCalledTimes(0);
      expect(endSessionSpy).toHaveBeenCalledTimes(1);
    });

    it('should call abort and not commit if user not found', async () => {
      const userUpdateSpy = jest.spyOn(userModel, 'findOneAndUpdate').mockReturnValue({
        session: jest.fn().mockReturnValue({
          exec: jest.fn().mockReturnValue(Promise.resolve(null)),
        }),
      });
      await expect(
        service.createProject('1', {
          title: 'test',
        } as CreateUserProjectDto)
      ).rejects.toThrow(NotFoundException);

      expect(userUpdateSpy).toHaveBeenCalled();
      expect(projectSaveSpy).toHaveBeenCalled();
      expect(startSessionSpy).toHaveBeenCalledTimes(1);
      expect(startTransSpy).toHaveBeenCalledTimes(1);
      expect(commitTransSpy).toHaveBeenCalledTimes(0);
      expect(abortTransSpy).toHaveBeenCalledTimes(1);
      expect(endSessionSpy).toHaveBeenCalledTimes(1);
    });
  });
});
