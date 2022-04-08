import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LogMiddleware } from './log.middleware.';
import { LogService } from './log.service';

@Module({
  providers: [LogService, LogMiddleware],
  exports: [LogService, LogMiddleware],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes('*');
  }
}
