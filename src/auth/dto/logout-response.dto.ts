import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class LogoutResponseDto {
  @ApiProperty({
    example: 'Successfully logged out',
    description: 'Logout message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'User logged out date',
  })
  @IsDateString()
  @IsNotEmpty()
  loggedOutAt: string;
}
