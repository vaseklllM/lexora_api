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
}
