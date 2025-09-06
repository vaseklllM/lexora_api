import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'generated/prisma';

export interface JwtPayload {
  sub: string;
  jwtId: string;
  iat?: number;
  exp?: number;
}

export interface ICurrentUser extends Omit<User, 'password'> {
  jwt: Omit<JwtPayload, 'sub' | 'jwtId'> & { id: JwtPayload['jwtId'] };
}

interface RequestWithUser extends Request {
  user: ICurrentUser;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
