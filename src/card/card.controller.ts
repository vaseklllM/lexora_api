import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
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
import { StartLearningSessionResponseDto } from './dto/start-learning-session-response.dto';
import { StartLearningSessionDto } from './dto/start-learning-session.dto';
import { StartReviewSessionDto } from './dto/start-review-session.dto';
import { StartReviewSessionResponseDto } from './dto/start-review-session-response.dto';
import { FinishLearningSessionResponseDto } from './dto/finish-learning-session-response.dto';
import { FinishLearningSessionDto } from './dto/finish-learning-session.dto';
import { FinishReviewCardResponseDto } from './dto/finish-review-card-response.dto';
import { FinishReviewCardDto } from './dto/finish-review-card.dto';
import { LearningStrategyType } from 'src/common/types/learningStrategyType';

@ApiTags('Cards')
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('start-learning-session')
  @Auth()
  @ApiOperation({ summary: 'Start learning session with new cards' })
  @ApiOkResponse({
    description: 'Returns new cards to start learning',
    type: StartLearningSessionResponseDto,
    isArray: true,
  })
  @ValidateResponse(StartLearningSessionResponseDto)
  startLearningSession(
    @CurrentUser() user: ICurrentUser,
    @Query() startLearningSessionDto: StartLearningSessionDto,
  ): Promise<StartLearningSessionResponseDto> {
    return this.cardService.startLearningSession(
      user.id,
      startLearningSessionDto,
    );
  }

  @Patch('finish-learning-session')
  @Auth()
  @ApiOperation({ summary: 'Finish learning session' })
  @ApiOkResponse({
    description: 'Returns the message about finished learning session',
    type: FinishLearningSessionResponseDto,
  })
  @ValidateResponse(FinishLearningSessionResponseDto)
  finishLearningSession(
    @CurrentUser() user: ICurrentUser,
    @Body() finishLearningSessionDto: FinishLearningSessionDto,
  ): Promise<FinishLearningSessionResponseDto> {
    return this.cardService.finishLearningSession(
      user.id,
      finishLearningSessionDto,
    );
  }

  @Get('start-review-session')
  @Auth()
  @ApiOperation({ summary: 'Start review session with learned cards' })
  @ApiOkResponse({
    description: 'Returns cards for review session',
    type: StartReviewSessionResponseDto,
    isArray: true,
  })
  @ValidateResponse(StartReviewSessionResponseDto)
  startReviewSession(
    @CurrentUser() user: ICurrentUser,
    @Query() startReviewSessionDto: StartReviewSessionDto,
  ): Promise<StartReviewSessionResponseDto> {
    return this.cardService.startReviewSession(user.id, startReviewSessionDto);
  }

  @Patch('finish-review-card')
  @Auth()
  @ApiOperation({
    summary: 'Finish review card',
    description: `List of learning strategy types: ${Object.values(LearningStrategyType).join(', ')}`,
  })
  @ApiOkResponse({
    description: 'Returns the message about finished review card',
    type: FinishReviewCardResponseDto,
  })
  @ValidateResponse(FinishReviewCardResponseDto)
  finishReviewCard(
    @CurrentUser() user: ICurrentUser,
    @Body() finishReviewCardDto: FinishReviewCardDto,
  ): Promise<FinishReviewCardResponseDto> {
    return this.cardService.finishReviewCard(user.id, finishReviewCardDto);
  }

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
