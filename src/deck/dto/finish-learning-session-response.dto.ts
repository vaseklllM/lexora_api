import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FinishLearningSessionResponseDto {
  @ApiProperty({
    example: 'Learning session finished successfully',
    description: 'Learning session finished message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
