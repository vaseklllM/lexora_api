import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { LearningStrategyType } from 'src/common/types/learningStrategyType';

export class FinishReviewCardDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Card id',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  cardId: string;

  @ApiProperty({
    example: true,
    description: 'Is correct answer',
  })
  @IsBoolean()
  @IsNotEmpty()
  isCorrectAnswer: boolean;

  @ApiProperty({
    example: LearningStrategyType.PAIR_IT,
    description: 'Weight of the answer for the card',
  })
  @IsEnum(LearningStrategyType)
  @IsNotEmpty()
  typeOfStrategy: LearningStrategyType;
}
