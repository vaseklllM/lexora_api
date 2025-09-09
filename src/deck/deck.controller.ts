import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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
import { DeleteDeckResponseDto } from './dto/delete-deck-response.dto';
import { DeleteDeckDto } from './dto/delete-deck.dto';
import { GetDeckResponseDto } from './dto/get-deck-response.dto';

@ApiTags('Decks')
@Controller('deck')
export class DeckController {
  constructor(private readonly deskService: DeckService) {}

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get a deck' })
  @ApiOkResponse({
    description: 'Returns the deck',
    type: GetDeckResponseDto,
  })
  @ValidateResponse(GetDeckResponseDto)
  get(
    @CurrentUser() user: ICurrentUser,
    @Param('id') deckId: string,
  ): Promise<GetDeckResponseDto> {
    return this.deskService.get(user.id, deckId);
  }

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

  @Patch('rename')
  @Auth()
  @ApiOperation({ summary: 'Rename a deck' })
  @ApiOkResponse({
    description: 'Returns the renamed deck',
    type: RenameDeckResponseDto,
  })
  @ValidateResponse(RenameDeckResponseDto)
  rename(
    @CurrentUser() user: ICurrentUser,
    @Body() renameDeckDto: RenameDeckDto,
  ): Promise<RenameDeckResponseDto> {
    return this.deskService.rename(user.id, renameDeckDto);
  }

  @Delete('delete')
  @Auth()
  @ApiOperation({ summary: 'Delete a deck' })
  @ApiOkResponse({
    description: 'Returns the message about deleted deck',
    type: DeleteDeckResponseDto,
  })
  @ValidateResponse(DeleteDeckResponseDto)
  delete(
    @CurrentUser() user: ICurrentUser,
    @Body() deleteDeckDto: DeleteDeckDto,
  ): Promise<DeleteDeckResponseDto> {
    return this.deskService.delete(user.id, deleteDeckDto);
  }
}
