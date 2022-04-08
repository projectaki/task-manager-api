import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const start = Date.now();
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:4200'],
  });
  app.setGlobalPrefix('api');
  await app.listen(3000);
  console.log(`Listening on port 3000. (${Date.now() - start}ms)`);
}
bootstrap();
