import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { SetLanguageDto } from './dto/set-language.dto';
import { type ICurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SetLanguageResponseDto } from './dto/set-language-response.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async setLanguage(
    user: ICurrentUser,
    setLanguageDto: SetLanguageDto,
  ): Promise<SetLanguageResponseDto> {
    await this.databaseService.$transaction(async (tx) => {
      const language = await tx.language.findUnique({
        where: { code: setLanguageDto.languageCode },
      });

      if (!language) {
        throw new NotFoundException('Language not found');
      }

      await tx.user.update({
        where: { id: user.id },
        data: { languageCode: setLanguageDto.languageCode },
      });
    });

    return {
      message: 'Language set successfully',
    };
  }
}
