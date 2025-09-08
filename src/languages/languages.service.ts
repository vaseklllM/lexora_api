import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { LanguagesResponseDto } from './dto/languages-response.dto';

@Injectable()
export class LanguagesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async all(): Promise<LanguagesResponseDto> {
    const languages = await this.databaseService.language.findMany();

    return {
      data: languages,
    };
  }
}
