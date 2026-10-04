import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

import { CheapSharkService } from './cheapshark.service.js';

@ApiTags('CheapShark')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations/cheapshark')
export class CheapSharkController {
  constructor(private readonly cheapSharkService: CheapSharkService) {}

  @Get('games')
  @ApiOperation({
    summary: 'Search games from CheapShark',
  })
  @ApiQuery({
    name: 'title',
    example: 'Elden Ring',
  })
  searchGames(
    @Query('title')
    title: string,
  ) {
    return this.cheapSharkService.searchGames(title);
  }
}
