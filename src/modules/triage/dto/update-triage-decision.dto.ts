import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateTriageDecisionDto {
  @ApiProperty({ example: 'accepted' })
  @IsIn(['pending', 'accepted', 'edited', 'rejected'])
  reviewStatus!: 'pending' | 'accepted' | 'edited' | 'rejected';

  @ApiProperty({ required: false, example: 'Escalate to same-day slot.' })
  @IsOptional()
  @IsString()
  clinicianSummary?: string;

  @ApiProperty({ required: false, example: 'Requested chest X-ray if symptoms continue.' })
  @IsOptional()
  @IsString()
  clinicianNote?: string;
}
