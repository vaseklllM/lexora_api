import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
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
  name: string;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBmYmY3...',
    description: 'Google ID token returned from the client',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({
    example: '1234567890',
    description: 'User account ID',
  })
  @IsString()
  @IsNotEmpty()
  accountId: string;
}
