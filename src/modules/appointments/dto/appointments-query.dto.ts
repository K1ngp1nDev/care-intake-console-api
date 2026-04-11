import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class AppointmentsQueryDto {
  @ApiPropertyOptional({ example: '2026-04-12' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 'scheduled' })
  @IsOptional()
  @IsIn(['scheduled', 'checked_in', 'triaged', 'follow_up'])
  status?: 'scheduled' | 'checked_in' | 'triaged' | 'follow_up';
}
