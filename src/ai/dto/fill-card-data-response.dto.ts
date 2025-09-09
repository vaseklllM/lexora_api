import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FillCardDataResponseDto {
  @ApiProperty({
    example: 'Card name',
    description: 'Card name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
