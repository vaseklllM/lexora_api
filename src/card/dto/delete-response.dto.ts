import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteCardResponseDto {
  @ApiProperty({
    example: 'Card deleted successfully',
    description: 'Card deleted message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
