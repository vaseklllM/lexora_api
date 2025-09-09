import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { GetCardResponseDto } from './get-card-response.dto';

export class GetCardsToLearnResponseDto {
  @ApiProperty({
    example: [GetCardResponseDto],
    description: 'Cards to learn',
  })
  @IsArray()
  @IsNotEmpty()
  cards: GetCardResponseDto[];
}
