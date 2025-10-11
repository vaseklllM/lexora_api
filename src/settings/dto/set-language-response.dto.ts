import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SetLanguageResponseDto {
  @ApiProperty({
    example: 'Language set successfully',
    description: 'Language set message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
