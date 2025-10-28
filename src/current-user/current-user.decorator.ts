import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ICurrentUser {
  uuid: string;
  company: string;
  sessionId: string;
}

export const CurrentUser = createParamDecorator<ICurrentUser>(
  (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return user;
  },
);
