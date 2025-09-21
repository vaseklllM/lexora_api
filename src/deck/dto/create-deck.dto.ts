import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { MAX_DECK_NAME_LENGTH } from 'src/common/config';

export class CreateDeckDto {
  @ApiProperty({
    example: 'Desk name',
    description: 'Desk name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_DECK_NAME_LENGTH)
  name: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    description: 'Folder id',
  })
  @IsString()
  @IsOptional()
  @IsUUID('4')
  folderId?: string;

  @ApiProperty({
    example: 'en',
    description: 'Language what I know id',
  })
  @IsString()
  @IsNotEmpty()
  languageWhatIKnowCode: string;

  @ApiProperty({
    example: 'uk',
    description: 'Language what I learn id',
  })
  @IsString()
  @IsNotEmpty()
  languageWhatILearnCode: string;
}
