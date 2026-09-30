import { ApiProperty } from '@nestjs/swagger';

export class DeleteGameResponseDto {
  @ApiProperty({
    example: 'Game with id 1 deleted successfully',
  })
  message: string;
}
