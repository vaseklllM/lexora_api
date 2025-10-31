import { Injectable, NotFoundException } from '@nestjs/common';
import { FillCardDataResponseDto } from './dto/fill-card-data-response.dto';
import { DatabaseService } from 'src/database/database.service';
import { FillCardDataDto } from './dto/fill-card-data.dto';
import { VertexProvider } from 'src/vertex/vertex';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AiService {
  constructor(
    private readonly database: DatabaseService,
    private readonly vertex: VertexProvider,
    private readonly httpService: HttpService,
  ) {}

  async fillCardData(
    userId: string,
    accessToken: string,
    fillCardDataDto: FillCardDataDto,
  ): Promise<FillCardDataResponseDto> {
    const deck = await this.database.deck.findUnique({
      where: { userId, id: fillCardDataDto.deckId },
      include: {
        languageWhatIKnow: true,
        languageWhatILearn: true,
      },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    const [languageWhatIKnow, languageWhatILearn] = await Promise.all([
      this.database.language.findUnique({
        where: { code: deck.languageWhatIKnow.code },
      }),
      this.database.language.findUnique({
        where: { code: deck.languageWhatILearn.code },
      }),
    ]);

    if (!languageWhatIKnow) {
      throw new NotFoundException('Language what I know not found');
    }

    if (!languageWhatILearn) {
      throw new NotFoundException('Language what I learn not found');
    }

    const response = await firstValueFrom(
      this.httpService.get<FillCardDataResponseDto>('ai/fill-card-data', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          word:
            fillCardDataDto.textInLearningLanguage ||
            fillCardDataDto.textInKnownLanguage!,
          languageWhatIKnowCode: languageWhatIKnow.code,
          languageWhatILearnCode: languageWhatILearn.code,
        },
      }),
    );

    return response.data;
  }
}
