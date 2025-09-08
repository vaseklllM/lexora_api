import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderService } from './folder.service';
import { CreateFolderResponseDto } from './dto/create-folder-response.dto';
import { Auth } from 'src/common/decorators/auth';
import { ValidateResponse } from 'src/common/decorators/validate-response.decorator';
import {
  CurrentUser,
  type ICurrentUser,
} from 'src/auth/decorators/current-user.decorator';

@ApiTags('Folders')
@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post('create')
  @Auth()
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiOkResponse({
    description: 'Returns the created folder',
    type: CreateFolderResponseDto,
  })
  @ValidateResponse(CreateFolderResponseDto)
  create(
    @Body() createFolderDto: CreateFolderDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<CreateFolderResponseDto> {
    return this.folderService.create(user.id, createFolderDto);
  }
}
