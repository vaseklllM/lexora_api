import { Injectable, NotFoundException } from '@nestjs/common';
import { FillCardDataResponseDto } from './dto/fill-card-data-response.dto';
import { DatabaseService } from 'src/database/database.service';
import { FillCardDataDto } from './dto/fill-card-data.dto';
import { VertexProvider } from 'src/vertex/vertex';
import { SchemaType } from '@google-cloud/vertexai';
import { Cefr } from '@prisma/client';

@Injectable()
export class AiService {
  constructor(
    private readonly database: DatabaseService,
    private readonly vertex: VertexProvider,
  ) {}

  async fillCardData(
    userId: string,
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

    const languageWhatIKnow = await this.database.language.findUnique({
      where: { code: deck.languageWhatIKnow.code },
    });

    if (!languageWhatIKnow) {
      throw new NotFoundException('Language what I know not found');
    }

    const languageWhatILearn = await this.database.language.findUnique({
      where: { code: deck.languageWhatILearn.code },
    });

    if (!languageWhatILearn) {
      throw new NotFoundException('Language what I learn not found');
    }

    const result = await this.vertex.generate<{
      term: string;
      cefr: Cefr;
      example: string;
      exampleTranslation: string;
      translations: string[];
    }>({
      // prompt: `Generate a CEFR-aligned dictionary card in JSON for "${fillCardDataDto.textInLearningLanguage}" (language: ${languageWhatILearn.code}). Keep definitions concise, 2 examples, sensible synonyms.`,
      prompt: `You are a CEFR-aligned dictionary assistant.

        Generate a JSON object that matches exactly the given schema for the word "${fillCardDataDto.textInLearningLanguage}".
        - The word is in language: ${languageWhatILearn.code}.
        - The "translations" array must contain 2–5 good translations of "${fillCardDataDto.textInLearningLanguage}" into language ${languageWhatIKnow.code}.
        - The "example" must be a simple sentence using "${fillCardDataDto.textInLearningLanguage}" in ${languageWhatILearn.code}.
        - The "exampleTranslation" must be the translation of that example sentence into ${languageWhatIKnow.code}.
        - The "cefr" level must be one of: A1, A2, B1, B2, C1, C2.
        - The "term" field must be the original word "${fillCardDataDto.textInLearningLanguage}" exactly.

        Return **only JSON**, strictly following the schema.
        `,
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          term: { type: SchemaType.STRING },
          example: { type: SchemaType.STRING },
          exampleTranslation: { type: SchemaType.STRING },
          cefr: {
            type: SchemaType.STRING,
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
          },
          translations: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: [
          'term',
          'cefr',
          'example',
          'exampleTranslation',
          'translations',
        ],
      },
    });

    return {
      textInKnownLanguage: result.translations
        .map((translation) => translation)
        .join(', '),
      textInLearningLanguage: result.term,
      descriptionInKnownLanguage: result.exampleTranslation,
      descriptionInLearningLanguage: result.example,
    };
  }
}
