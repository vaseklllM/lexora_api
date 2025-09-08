import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Folders')
@Controller('folder')
export class FolderController {}
