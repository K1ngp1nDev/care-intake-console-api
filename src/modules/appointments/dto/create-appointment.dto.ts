import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  patientId!: number;

  @ApiProperty({ example: '2026-04-12T15:00:00.000Z' })
  @IsString()
  scheduledFor!: string;

  @ApiProperty({ example: 'Same-day evaluation' })
  @IsString()
  visitType!: string;

  @ApiProperty({ example: 'Dr. Huang' })
  @IsString()
  clinician!: string;

  @ApiProperty({ example: 'Room 2C' })
  @IsString()
  location!: string;

  @ApiProperty({ required: false, example: 'scheduled' })
  @IsOptional()
  @IsIn(['scheduled', 'checked_in', 'triaged', 'follow_up'])
  status?: 'scheduled' | 'checked_in' | 'triaged' | 'follow_up';
}
