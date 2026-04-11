import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class GenerateFollowUpsDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  triageId!: number;
}
