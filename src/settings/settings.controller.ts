import { Body, Controller, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Auth } from 'src/common/decorators/auth';
import {
  CurrentUser,
  type ICurrentUser,
} from 'src/auth/decorators/current-user.decorator';
import { SetLanguageDto } from './dto/set-language.dto';
import { SetLanguageResponseDto } from './dto/set-language-response.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ValidateResponse } from 'src/common/decorators/validate-response.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Patch('set-language')
  @Auth()
  @ApiOperation({ summary: 'Set language' })
  @ApiOkResponse({
    description: 'Returns the message about set language',
    type: SetLanguageResponseDto,
  })
  @ValidateResponse(SetLanguageResponseDto)
  setLanguage(
    @Body() setLanguageDto: SetLanguageDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<SetLanguageResponseDto> {
    return this.settingsService.setLanguage(user, setLanguageDto);
  }
}
