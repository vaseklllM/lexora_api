import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth';
import { GetDashboardResponseDto } from './dto/get-dashboard-response.dto';
import { ValidateResponse } from 'src/common/decorators/validate-response.decorator';
import {
  CurrentUser,
  type ICurrentUser,
} from 'src/auth/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get the dashboard' })
  @ApiOkResponse({
    description: 'Returns the dashboard',
    type: GetDashboardResponseDto,
  })
  @ValidateResponse(GetDashboardResponseDto)
  getDashboard(
    @CurrentUser() user: ICurrentUser,
  ): Promise<GetDashboardResponseDto> {
    return this.dashboardService.getDashboard(user.id);
  }
}
