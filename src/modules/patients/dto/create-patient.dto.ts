import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'Jordan Ortega' })
  @IsString()
  @MaxLength(160)
  fullName!: string;

  @ApiProperty({ example: '1984-11-12' })
  @IsString()
  dateOfBirth!: string;

  @ApiProperty({ example: '+1 415 555 0144' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'jordan.ortega@example.test' })
  @IsEmail()
  email!: string;

  @ApiProperty({ required: false, example: ['new patient'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
