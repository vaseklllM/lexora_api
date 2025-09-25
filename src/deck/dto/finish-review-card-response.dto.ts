import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FinishReviewCardResponseDto {
  @ApiProperty({
    example: 'Review card finished successfully',
    description: 'Review card finished message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
