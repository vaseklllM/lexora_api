import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { LanguagesResponseDto } from './dto/languages-response.dto';
import { GetMyLanguagesResponseDto } from './dto/get-my-languages-response.dto';
import { LanguageDto } from './dto/language.dto';
import { Language } from '@prisma/client';

@Injectable()
export class LanguagesService {
  constructor(private readonly databaseService: DatabaseService) {}

  public convertLanguageToLanguageDto(language: Language): LanguageDto {
    return {
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
      iconSymbol: language.iconSymbol,
      googleTtsVoiceFemaleName: language.googleTtsVoiceFemaleName ?? undefined,
      googleTtsVoiceMaleName: language.googleTtsVoiceMaleName ?? undefined,
    };
  }

  async all(): Promise<LanguagesResponseDto> {
    const languages = await this.databaseService.language.findMany({
      orderBy: { name: 'asc' },
    });

    return {
      data: languages.map((lang) => this.convertLanguageToLanguageDto(lang)),
    };
  }

  async my(userId: string): Promise<GetMyLanguagesResponseDto> {
    const languagesWhatIKnow = await this.databaseService.language.findMany({
      where: {
        decksWhatIKnow: { some: { userId } },
      },
    });

    const languagesWhatILearn = await this.databaseService.language.findMany({
      where: {
        decksWhatILearn: { some: { userId } },
      },
    });

    return {
      languagesWhatIKnow: languagesWhatIKnow.map((lang) =>
        this.convertLanguageToLanguageDto(lang),
      ),
      languagesWhatILearn: languagesWhatILearn.map((lang) =>
        this.convertLanguageToLanguageDto(lang),
      ),
    };
  }
}
