import { Injectable, NotFoundException } from '@nestjs/common';
import { FillCardDataResponseDto } from './dto/fill-card-data-response.dto';
import { DatabaseService } from 'src/database/database.service';
import { FillCardDataDto } from './dto/fill-card-data.dto';
import { VertexProvider } from 'src/vertex/vertex';
import { SchemaType } from '@google-cloud/vertexai';

@Injectable()
export class AiService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly vertex: VertexProvider,
  ) {}

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

    const result = await this.vertex.generate({
      prompt: `Generate a CEFR-aligned dictionary card in JSON for "${fillCardDataDto.textInLearningLanguage}" (language: ${languageWhatILearn.code}). Keep definitions concise, 2 examples, sensible synonyms.`,
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          term: { type: SchemaType.STRING },
          lang: { type: SchemaType.STRING },
          pos: { type: SchemaType.STRING },
          definition_short: { type: SchemaType.STRING },
          definition_long: { type: SchemaType.STRING },
          examples: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          synonyms: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          antonyms: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          // ipa: { type: SchemaType.STRING },
          cefr: {
            type: SchemaType.STRING,
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
          },
          translations: {
            type: SchemaType.OBJECT,
            properties: {
              uk: { type: SchemaType.STRING },
              es: { type: SchemaType.STRING },
              nl: { type: SchemaType.STRING },
            },
          },
          notes: { type: SchemaType.STRING },
        },
        required: [
          'term',
          'lang',
          'pos',
          'definition_short',
          'examples',
          'translations',
        ],
      },
    });

    console.log(result);

    return {
      textInKnownLanguage: `Книга - deck: '${deck.name}' (${languageWhatIKnow.name} - ${languageWhatILearn.name})`,
      textInLearningLanguage: 'Book',
      descriptionInKnownLanguage:
        'Книга - це друкований або електронний твір, що містить текст, зображення або інші матеріали для читання та навчання',
      descriptionInLearningLanguage:
        'A book is a printed or electronic work containing text, images, or other materials for reading and learning',
    };
  }
}
