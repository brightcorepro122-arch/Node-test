import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateSymbolDto {
  @ApiProperty({ example: 'BTC/USD' })
  @IsString()
  name: string;

  @ApiProperty({ example: true, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @ApiProperty({ example: 50000.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

