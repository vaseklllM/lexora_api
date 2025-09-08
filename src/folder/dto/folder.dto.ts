import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({
    example: 'Folder name',
    description: 'Folder name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Folder id',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Folder creation date',
  })
  @IsDateString()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Folder last update date',
  })
  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  updatedAt: string;
}
