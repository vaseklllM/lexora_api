import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class RefreshResponseDto {
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
}
