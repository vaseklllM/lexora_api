import { UseInterceptors } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';
import { ResponseValidationInterceptor } from '../interceptors/response-validation.interceptor';

export function ValidateResponse(responseDto: ClassConstructor<object>) {
  return UseInterceptors(new ResponseValidationInterceptor(responseDto));
}
