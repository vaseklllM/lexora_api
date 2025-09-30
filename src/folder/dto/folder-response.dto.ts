import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { DeckDto, DeckExample } from 'src/deck/dto/deck.dto';
import { Type } from 'class-transformer';

export const folderExample: FolderDto = {
  name: 'Folder name',
  id: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  numberOfCards: 10,
};

export class FolderDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Folder id',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @ApiProperty({
    example: 'Folder name',
    description: 'Folder name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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
  updatedAt?: string;

  @ApiProperty({
    example: 10,
    description: 'Number of cards in the folder',
  })
  @IsNumber()
  @IsNotEmpty()
  numberOfCards: number;
}

export class FolderBreadcrumbDto {
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
  @IsUUID('4')
  id: string;
}

export class FolderResponseDto extends FolderDto {
  @ApiProperty({
    type: [FolderDto],
    example: [folderExample],
    description: 'Child folders',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FolderDto)
  childFolders: FolderDto[];

  @ApiProperty({
    type: [DeckDto],
    example: [DeckExample],
    description: 'Child decks',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DeckDto)
  childDecks: DeckDto[];

  @ApiProperty({
    type: [FolderBreadcrumbDto],
    example: [folderExample],
    description: 'Parent folder',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FolderBreadcrumbDto)
  breadcrumbs: FolderBreadcrumbDto[];

  @ApiProperty({
    example: folderExample,
    description: 'Parent folder id',
  })
  @Type(() => FolderDto)
  @IsOptional()
  parentFolder?: FolderDto;
}
