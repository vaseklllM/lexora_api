import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth';
import { CreateCardResponseDto } from './dto/create-response.dto';
import { ValidateResponse } from 'src/common/decorators/validate-response.decorator';
import { CreateCardDto } from './dto/create.dto';
import {
  CurrentUser,
  type ICurrentUser,
} from 'src/auth/decorators/current-user.decorator';
import { CardService } from './card.service';
import { GetCardResponseDto } from './dto/get-card-response.dto';

@ApiTags('Cards')
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get a card' })
  @ApiOkResponse({
    description: 'Returns the card',
    type: GetCardResponseDto,
  })
  @ValidateResponse(GetCardResponseDto)
  get(
    @Param('id') cardId: string,
    @CurrentUser() user: ICurrentUser,
  ): Promise<GetCardResponseDto> {
    return this.cardService.get(user.id, cardId);
  }

  @Post('create')
  @Auth()
  @ApiOperation({ summary: 'Create a new card' })
  @ApiOkResponse({
    description: 'Returns the created card',
    type: CreateCardResponseDto,
  })
  @ValidateResponse(CreateCardResponseDto)
  create(
    @Body() createCardDto: CreateCardDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<CreateCardResponseDto> {
    return this.cardService.create(user.id, createCardDto);
  }
}
