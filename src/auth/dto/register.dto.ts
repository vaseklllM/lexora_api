import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { MatchPasswords } from '../validators/match-passwords.validator';

const passwordExample = 'Password123!';
const MIN_PASSWORD_LENGTH = 8;

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^(?!\d+$).*$/, {
    message: 'Name cannot contain only digits',
  })
  name: string;

  @ApiProperty({
    example: passwordExample,
    description: 'User password',
    minLength: MIN_PASSWORD_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_PASSWORD_LENGTH)
  @Matches(/.*[A-Z].*/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?].*/, {
    message: 'Password must contain at least one special character',
  })
  @Matches(/^\S*$/, {
    message: 'Password must not contain spaces',
  })
  password: string;

  @ApiProperty({
    example: passwordExample,
    description: 'Confirm password - must match password',
    minLength: MIN_PASSWORD_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Password repeat must be at least ${MIN_PASSWORD_LENGTH} characters long`,
  })
  @MatchPasswords('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
