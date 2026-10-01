import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

import { UserRole } from '../users/enums/user-role.enum.js';

import { CreateGameDto } from './dto/create-game.dto.js';
import { DeleteGameResponseDto } from './dto/delete-game-response.dto.js';
import { GameResponseDto } from './dto/game-response.dto.js';
import { UpdateGameDto } from './dto/update-game.dto.js';

import { GamesService } from './games.service.js';

@ApiTags('Games')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get game catalog',
  })
  @ApiOkResponse({
    type: GameResponseDto,
    isArray: true,
  })
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get catalog game by id',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    type: GameResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Game not found',
  })
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.gamesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create catalog game - admin only',
  })
  @ApiCreatedResponse({
    type: GameResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Admin role required',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  create(
    @Body()
    dto: CreateGameDto,
  ) {
    return this.gamesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update catalog game - admin only',
  })
  @ApiOkResponse({
    type: GameResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Admin role required',
  })
  @ApiNotFoundResponse({
    description: 'Game not found',
  })
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateGameDto,
  ) {
    return this.gamesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete catalog game - admin only',
  })
  @ApiOkResponse({
    type: DeleteGameResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Admin role required',
  })
  @ApiNotFoundResponse({
    description: 'Game not found',
  })
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.gamesService.remove(id);
  }
}
