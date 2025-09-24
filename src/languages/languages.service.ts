import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { LanguagesResponseDto } from './dto/languages-response.dto';
import { GetMyLanguagesResponseDto } from './dto/get-my-languages-response.dto';

@Injectable()
export class LanguagesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async all(): Promise<LanguagesResponseDto> {
    const languages = await this.databaseService.language.findMany();

    return {
      data: languages,
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
      languagesWhatIKnow: languagesWhatIKnow,
      languagesWhatILearn: languagesWhatILearn,
    };
  }
}
