import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { MAX_DECK_NAME_LENGTH } from 'src/common/config';

export class RenameDeckDto {
  @ApiProperty({
    example: 'lesson 1',
    description: 'Deck name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_DECK_NAME_LENGTH)
  name: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Deck id',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  deckId: string;
}
