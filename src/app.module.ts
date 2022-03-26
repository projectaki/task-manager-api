import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, ProjectsModule, TasksModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
