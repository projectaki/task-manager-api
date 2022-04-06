import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  //const { user } = ctx.switchToHttp().getRequest();
  const user: any = {};
  user.role = 'admins';
  user.sub = '62423d9da09e7efbf5dd8bf6';
  return user;
});
