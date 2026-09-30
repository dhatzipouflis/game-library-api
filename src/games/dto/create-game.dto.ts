import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({
    example: 'Street Fighter 6',
    description: 'The title of the game',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 'Fighting',
    description: 'The genre of the game',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  genre: string;

  @ApiPropertyOptional({
    example: 'PC',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  platform?: string;
}
