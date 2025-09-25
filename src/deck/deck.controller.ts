import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
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
import { StartLearningSessionResponseDto } from './dto/start-learning-session-response.dto';
import { StartLearningSessionDto } from './dto/start-learning-session.dto';
import { StartReviewSessionDto } from './dto/start-review-session.dto';
import { StartReviewSessionResponseDto } from './dto/start-review-session-response.dto';
import { FinishLearningSessionResponseDto } from './dto/finish-learning-session-response.dto';
import { FinishLearningSessionDto } from './dto/finish-learning-session.dto';
import { FinishReviewCardResponseDto } from './dto/finish-review-card-response.dto';
import { FinishReviewCardDto } from './dto/finish-review-card.dto';
import { LearningStrategyType } from 'src/common/types/learningStrategyType';

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
    console.log('user ----> ', user);
    return this.deskService.startLearningSession(
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
    return this.deskService.finishLearningSession(
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
    return this.deskService.startReviewSession(user.id, startReviewSessionDto);
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
    return this.deskService.finishReviewCard(user.id, finishReviewCardDto);
  }

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
    return this.deskService.getDeck(user.id, deckId);
  }
}
