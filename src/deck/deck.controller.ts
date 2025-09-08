import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import {
  CurrentUser,
  type ICurrentUser,
} from 'src/auth/decorators/current-user.decorator';
import { Auth } from 'src/common/decorators/auth';
import { CreateDeckResponseDto } from './dto/create-deck-response.dto';
import { ValidateResponse } from 'src/common/decorators/validate-response.decorator';
import { RenameDeckDto } from './dto/rename-deck.dto';
import { RenameDeckResponseDto } from './dto/rename-deck-response.dto';

@ApiTags('Decks')
@Controller('deck')
export class DeckController {
  constructor(private readonly deskService: DeckService) {}

  @Post('create')
  @Auth()
  @ApiOperation({ summary: 'Create a new deck' })
  @ApiOkResponse({
    description: 'Returns the created deck',
    type: CreateDeckResponseDto,
  })
  @ValidateResponse(CreateDeckResponseDto)
  create(
    @CurrentUser() user: ICurrentUser,
    @Body() createDeckDto: CreateDeckDto,
  ): Promise<CreateDeckResponseDto> {
    return this.deskService.create(user.id, createDeckDto);
  }

  @Post('rename')
  @Auth()
  @ApiOperation({ summary: 'Rename a deck' })
  @ApiOkResponse({
    description: 'Returns the renamed deck',
    type: CreateDeckResponseDto,
  })
  @ValidateResponse(CreateDeckResponseDto)
  rename(
    @CurrentUser() user: ICurrentUser,
    @Body() renameDeckDto: RenameDeckDto,
  ): Promise<RenameDeckResponseDto> {
    return this.deskService.rename(user.id, renameDeckDto);
  }
}
