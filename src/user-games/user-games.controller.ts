import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { UserGamesService } from './user-games.service.js';

@ApiTags('Library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('library')
export class UserGamesController {
  constructor(private readonly userGamesService: UserGamesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get my game library',
  })
  @ApiOkResponse({
    description: 'User game library',
  })
  findAll(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.userGamesService.findAll(user.id);
  }

  @Post(':gameId')
  @ApiOperation({
    summary: 'Add catalog game to my library',
  })
  @ApiConflictResponse({
    description: 'Game is already in your library',
  })
  @ApiNotFoundResponse({
    description: 'Game does not exist in catalog',
  })
  addGame(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('gameId', ParseIntPipe)
    gameId: number,
  ) {
    return this.userGamesService.addGame(user.id, gameId);
  }

  @Delete(':gameId')
  @ApiOperation({
    summary: 'Remove game from my library',
  })
  @ApiNotFoundResponse({
    description: 'Game is not in your library',
  })
  removeGame(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('gameId', ParseIntPipe)
    gameId: number,
  ) {
    return this.userGamesService.removeGame(user.id, gameId);
  }
}
