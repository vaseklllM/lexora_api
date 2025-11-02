import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type ICurrentUser,
} from 'src/auth/decorators/current-user.decorator';
import { Auth } from 'src/common/decorators/auth';
import { ValidateResponse } from 'src/common/decorators/validate-response.decorator';
import { FillCardDataResponseDto } from './dto/fill-card-data-response.dto';
import { FillCardDataDto } from './dto/fill-card-data.dto';
import { AiService } from './ai.service';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('fill-card-data')
  @Auth()
  @ApiOperation({ summary: 'Fill card data' })
  @ApiOkResponse({
    description: 'Returns the filled card data',
    type: FillCardDataResponseDto,
  })
  @ValidateResponse(FillCardDataResponseDto)
  fillCardData(
    @CurrentUser() user: ICurrentUser,
    @Query() fillCardDataDto: FillCardDataDto,
  ): Promise<FillCardDataResponseDto> {
    return this.aiService.fillCardData(user.id, fillCardDataDto);
  }
}
