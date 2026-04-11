import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsObject, IsString } from 'class-validator';

export class CreateIntakeDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  patientId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  appointmentId!: number;

  @ApiProperty({ type: [String], example: ['chest tightness', 'fever'] })
  @IsArray()
  @IsString({ each: true })
  symptoms!: string[];

  @ApiProperty({ example: 'Symptoms worsened overnight after a week of cough.' })
  @IsString()
  notes!: string;

  @ApiProperty({
    example: {
      duration: '7 days',
      allergies: 'penicillin',
      medications: 'acetaminophen',
    },
  })
  @IsObject()
  answers!: Record<string, string>;
}
