import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Alex Morgan' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'alex@example.test' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @MinLength(4)
  password!: string;
}
