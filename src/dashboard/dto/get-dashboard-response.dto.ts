import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { DeckDto, DeckExample } from 'src/deck/dto/deck.dto';
import { FolderDto, folderExample } from 'src/folder/dto/folder-response.dto';

export class GetDashboardResponseDto {
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
}
