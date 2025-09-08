import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';

import { LanguagesResponseDto } from './dto/languages-response.dto';

@ApiTags('Languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all languages' })
  @ApiOkResponse({
    description: 'Returns all languages',
    type: [LanguagesResponseDto],
  })
  all(): Promise<LanguagesResponseDto> {
    return this.languagesService.all();
  }
}
