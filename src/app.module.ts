import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import configuration, { DBConfig } from './config/configuration';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { ProjectMembersModule } from './project-members/project-members.module';
import { UserProjectsModule } from './user-projects/user-projects.module';
import { ProjectTasksModule } from './project-tasks/project-tasks.module';
import { AuthModule } from './auth/auth.module';
import { ExceptionsModule } from './exceptions/exceptions.module';

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<DBConfig>('database').uri,
      }),
      inject: [ConfigService],
    }),
    ProjectTasksModule,
    ProjectMembersModule,
    UserProjectsModule,
    AuthModule,
    ExceptionsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
