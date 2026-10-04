import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, Min } from 'class-validator';

import { Type } from 'class-transformer';

export class SetPriceAlertDto {
  @ApiProperty({
    example: 29.99,
  })
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0.01)
  targetPrice!: number;
}
