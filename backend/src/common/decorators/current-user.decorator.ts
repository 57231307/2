import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 获取当前登录用户
 * 用于在控制器中获取当前认证用户的信息
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
