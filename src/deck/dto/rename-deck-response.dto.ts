import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RenameDeckResponseDto {
  @ApiProperty({
    example: 'Deck renamed successfully',
    description: 'Deck renamed message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
