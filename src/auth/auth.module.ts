import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtGuard } from 'src/core/guards/jwt.guard';
import { PermissionGuard } from 'src/core/guards/permission.guard';
import { RoleGuard } from 'src/core/guards/role.guard';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), UsersModule],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [],
})
export class AuthModule {}
