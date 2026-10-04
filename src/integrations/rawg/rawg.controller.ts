import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator.js';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

import { UserRole } from '../../users/enums/user-role.enum.js';

import { RawgImportService } from './rawg-import.service.js';
import { RawgService } from './rawg.service.js';

@ApiTags('RAWG')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('integrations/rawg')
export class RawgController {
  constructor(
    private readonly rawgService: RawgService,

    private readonly rawgImportService: RawgImportService,
  ) {}

  @Get('games')
  @ApiOperation({
    summary: 'Search games from RAWG',
  })
  @ApiQuery({
    name: 'search',
    example: 'Elden Ring',
  })
  searchGames(
    @Query('search')
    search: string,
  ) {
    return this.rawgService.searchGames(search);
  }

  @Post('games/:rawgId/import')
  @ApiOperation({
    summary: 'Import RAWG game into catalog',
  })
  importGame(
    @Param('rawgId', ParseIntPipe)
    rawgId: number,
  ) {
    return this.rawgImportService.importGame(rawgId);
  }
}
