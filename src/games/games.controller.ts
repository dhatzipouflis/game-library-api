import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { GamesService } from './games.service.js';

import { CreateGameDto } from './dto/create-game.dto.js';
import { UpdateGameDto } from './dto/update-game.dto.js';
import { GameResponseDto } from './dto/game-response.dto.js';
import { DeleteGameResponseDto } from './dto/delete-game-response.dto.js';
import { FindGamesQueryDto } from './dto/find-games-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Games')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({
    summary: 'Search games',
    description:
      'Returns paginated games with optional genre filtering and title search.',
  })
  search(@Query() query: FindGamesQueryDto) {
    return this.gamesService.search(query);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all games',
    description: 'Returns a paginated list of all games.',
  })
  @ApiOkResponse({
    description: 'Games retrieved successfully.',
    type: [GameResponseDto],
  })
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get game by id',
    description: 'Returns a single game using its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Game identifier',
  })
  @ApiOkResponse({
    description: 'Game retrieved successfully.',
    type: GameResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The supplied id is not a valid number.',
  })
  @ApiNotFoundResponse({
    description: 'Game was not found.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a game',
    description: 'Adds a new game to the library.',
  })
  @ApiCreatedResponse({
    description: 'Game created successfully.',
    type: GameResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body.',
  })
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a game',
    description:
      'Partially updates an existing game. Only supplied properties are changed.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Game identifier',
  })
  @ApiOkResponse({
    description: 'Game updated successfully.',
    type: GameResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid id or request body.',
  })
  @ApiNotFoundResponse({
    description: 'Game was not found.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a game',
    description: 'Removes a game from the library.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Game identifier',
  })
  @ApiOkResponse({
    description: 'Game deleted successfully.',
    type: DeleteGameResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The supplied id is not a valid number.',
  })
  @ApiNotFoundResponse({
    description: 'Game was not found.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.remove(id);
  }
}
