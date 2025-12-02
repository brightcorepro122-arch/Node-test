import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'client123' })
  @IsString()
  @MinLength(6)
  password: string;
}

