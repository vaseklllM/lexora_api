import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { MAX_FOLDER_NAME_LENGTH } from 'src/common/config';

export class CreateFolderDto {
  @ApiProperty({
    example: 'Folder name',
    description: 'Folder name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_FOLDER_NAME_LENGTH)
  name: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    description: 'Parent folder id',
  })
  @IsString()
  @IsOptional()
  @IsUUID('4')
  parentFolderId?: string;
}
