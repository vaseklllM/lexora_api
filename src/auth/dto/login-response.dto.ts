import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from './user.dto';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'User token',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'User token',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  refreshToken: string;

  @ApiProperty({
    example: 3600,
    description: 'Token expiration time',
  })
  @IsNumber()
  @IsNotEmpty()
  expiresIn: number;

  @ApiProperty({
    type: UserDto,
    description: 'User info',
  })
  @ValidateNested()
  @Type(() => UserDto)
  @IsNotEmpty()
  user: UserDto;
}
