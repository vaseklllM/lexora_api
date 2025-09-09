import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
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
import { UpdateCardDto } from './dto/update.dto';
import { UpdateCardResponseDto } from './dto/update-response.dto';
import { DeleteCardResponseDto } from './dto/delete-response.dto';

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

  @Put('update')
  @Auth()
  @ApiOperation({ summary: 'Update a card' })
  @ApiOkResponse({
    description: 'Returns the updated card',
    type: UpdateCardResponseDto,
  })
  @ValidateResponse(UpdateCardResponseDto)
  update(
    @Body() updateCardDto: UpdateCardDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<UpdateCardResponseDto> {
    return this.cardService.update(user.id, updateCardDto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete a card' })
  @ApiOkResponse({
    description: 'Returns the message about deleted card',
    type: DeleteCardResponseDto,
  })
  @ValidateResponse(DeleteCardResponseDto)
  delete(
    @Param('id') cardId: string,
    @CurrentUser() user: ICurrentUser,
  ): Promise<DeleteCardResponseDto> {
    return this.cardService.delete(user.id, cardId);
  }
}
