import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function createApp(): Promise<INestApplication> {
  const start = Date.now();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  await app.init();
  console.log(`Application is ready in ${Date.now() - start}ms`);
  return app;
}
