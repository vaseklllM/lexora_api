import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CardDto, CardExample } from 'src/card/dto/card.dto';
import { DeckDto } from './deck.dto';
import { Type } from 'class-transformer';
import {
  FolderBreadcrumbDto,
  folderExample,
} from 'src/folder/dto/folder-response.dto';

export class GetDeckResponseDto extends DeckDto {
  @ApiProperty({
    type: [CardDto],
    example: [CardExample],
    description: 'Cards',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  cards: CardDto[];

  @ApiProperty({
    type: [FolderBreadcrumbDto],
    example: [folderExample],
    description: 'Parent folder',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FolderBreadcrumbDto)
  foldersBreadcrumbs: FolderBreadcrumbDto[];
}
