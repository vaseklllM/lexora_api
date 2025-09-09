import { Injectable, NotFoundException } from '@nestjs/common';
import { FillCardDataResponseDto } from './dto/fill-card-data-response.dto';
import { DatabaseService } from 'src/database/database.service';
import { FillCardDataDto } from './dto/fill-card-data.dto';

@Injectable()
export class AiService {
  constructor(private readonly databaseService: DatabaseService) {}

  async fillCardData(
    userId: string,
    fillCardDataDto: FillCardDataDto,
  ): Promise<FillCardDataResponseDto> {
    const deck = await this.databaseService.deck.findUnique({
      where: { userId, id: fillCardDataDto.deckId },
      include: {
        languageWhatIKnow: true,
        languageWhatILearn: true,
      },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    const languageWhatIKnow = await this.databaseService.language.findUnique({
      where: { code: deck.languageWhatIKnow.code },
    });

    if (!languageWhatIKnow) {
      throw new NotFoundException('Language what I know not found');
    }

    const languageWhatILearn = await this.databaseService.language.findUnique({
      where: { code: deck.languageWhatILearn.code },
    });

    if (!languageWhatILearn) {
      throw new NotFoundException('Language what I learn not found');
    }

    return {
      name: `${deck.name} (${languageWhatIKnow.name} - ${languageWhatILearn.name})`,
    };
  }
}
