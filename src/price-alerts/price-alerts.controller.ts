import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { SetPriceAlertDto } from './dto/set-price-alert.dto.js';

import { PriceAlertsService } from './price-alerts.service.js';
import { PriceAlertMonitorService } from './price-alert-monitor.service.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Price Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('price-alerts')
export class PriceAlertsController {
  constructor(
    private readonly priceAlertsService: PriceAlertsService,
    private readonly priceAlertMonitorService: PriceAlertMonitorService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get my price alerts',
  })
  findAll(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.priceAlertsService.findAll(user.id);
  }

  @Put(':gameId')
  @ApiOperation({
    summary: 'Create or update price alert',
  })
  setAlert(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('gameId', ParseIntPipe)
    gameId: number,

    @Body()
    dto: SetPriceAlertDto,
  ) {
    return this.priceAlertsService.setAlert(user.id, gameId, dto.targetPrice);
  }

  @Delete(':gameId')
  @ApiOperation({
    summary: 'Remove price alert',
  })
  removeAlert(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('gameId', ParseIntPipe)
    gameId: number,
  ) {
    return this.priceAlertsService.removeAlert(user.id, gameId);
  }

  @Post('check-now')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Manually check all active price alerts - admin only',
  })
  async checkNow() {
    await this.priceAlertMonitorService.checkAlerts();

    return {
      message: 'Price alerts checked successfully',
    };
  }
}
