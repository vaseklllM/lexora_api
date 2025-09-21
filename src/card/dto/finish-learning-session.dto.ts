import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class FinishLearningSessionDto {
  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    description: 'Card ids',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayUnique()
  cardIds: string[];
}
