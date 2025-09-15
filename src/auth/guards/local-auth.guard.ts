import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    // Validate DTO first
    const loginDto = plainToInstance(LoginDto, body);
    const validationErrors = await validate(loginDto);

    if (validationErrors.length > 0) {
      // Use the same error grouping logic as in main.ts
      const messages: string[] = [];
      const errorsByField: Record<string, string[]> = {};

      const collectErrors = (errors: any[], parentPath?: string) => {
        for (const err of errors) {
          const propertyPath = parentPath
            ? `${parentPath}.${err.property}`
            : err.property;
          const constraints: string[] = err?.constraints
            ? Object.values(err.constraints)
            : [];
          if (constraints.length) {
            messages.push(...constraints);
            errorsByField[propertyPath] = constraints;
          }
          if (Array.isArray(err.children) && err.children.length > 0) {
            collectErrors(err.children, propertyPath);
          }
        }
      };

      collectErrors(validationErrors);

      throw new UnauthorizedException({
        statusCode: 400,
        error: 'Bad Request',
        message: messages,
        errors: errorsByField,
      });
    }

    // If validation passes, proceed with authentication
    return super.canActivate(context) as Promise<boolean>;
  }
}
