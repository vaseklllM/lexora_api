import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MoveResponseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Successfully moved deck to folder',
    description: 'Message about moved deck',
  })
  message: string;
}
