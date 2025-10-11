import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';
import { LanguagesResponseDto } from './dto/languages-response.dto';
import { GetMyLanguagesResponseDto } from './dto/get-my-languages-response.dto';
import { Auth } from 'src/common/decorators/auth';
import {
  CurrentUser,
  type ICurrentUser,
} from 'src/auth/decorators/current-user.decorator';

@ApiTags('Languages')
@Controller('languages')
@UseInterceptors(CacheInterceptor)
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all languages' })
  @ApiOkResponse({
    description: 'Returns all languages',
    type: [LanguagesResponseDto],
  })
  @CacheTTL(24 * 60 * 60)
  all(): Promise<LanguagesResponseDto> {
    return this.languagesService.all();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my languages' })
  @ApiOkResponse({
    description: 'Returns my languages',
    type: GetMyLanguagesResponseDto,
  })
  @Auth()
  my(@CurrentUser() user: ICurrentUser): Promise<GetMyLanguagesResponseDto> {
    return this.languagesService.my(user.id);
  }
}
