import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteDeckResponseDto {
  @ApiProperty({
    example: 'Deck deleted successfully',
    description: 'Deck deleted message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
