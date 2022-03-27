import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, ProjectsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
