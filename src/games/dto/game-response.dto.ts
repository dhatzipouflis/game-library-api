import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GameResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the game',
  })
  id: number;

  @ApiProperty({
    example: 'Street Fighter 6',
  })
  title: string;

  @ApiProperty({
    example: 'Fighting',
  })
  genre: string;

  @ApiProperty({
    example: '2026-09-29T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    example: 'PC',
  })
  platform?: string;
}
