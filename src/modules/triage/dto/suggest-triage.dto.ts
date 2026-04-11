import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class SuggestTriageDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  intakeId!: number;
}
