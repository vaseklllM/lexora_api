import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { DeckDto, DeckExample } from 'src/deck/dto/deck.dto';
import { FolderDto, folderExample } from 'src/folder/dto/folder-response.dto';

export class GetDashboardResponseDto {
  @ApiProperty({
    example: [folderExample],
    description: 'Child folders',
  })
  @IsArray()
  @IsNotEmpty()
  childFolders: FolderDto[];

  @ApiProperty({
    example: [DeckExample],
    description: 'Child decks',
  })
  @IsArray()
  @IsNotEmpty()
  childDecks: DeckDto[];
}
