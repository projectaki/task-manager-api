import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const start = Date.now();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log(`Listening on port 3000. (${Date.now() - start}ms)`);
}
bootstrap();
