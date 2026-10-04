import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

import { GameDealsService } from './game-deals.service.js';

@ApiTags('Game Deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GameDealsController {
  constructor(private readonly gameDealsService: GameDealsService) {}

  @Get(':id/deals')
  @ApiOperation({
    summary: 'Get current CheapShark deals for a catalog game',
  })
  getDeals(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.gameDealsService.getDeals(id);
  }
}
