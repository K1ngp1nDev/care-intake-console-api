import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'demo@careintake.test' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @MinLength(4)
  password!: string;

  @ApiProperty({ required: false, example: 'care-intake-console-web' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  deviceName?: string;
}
