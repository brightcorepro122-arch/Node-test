import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateSymbolDto {
  @ApiProperty({ example: 'BTC/USD', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @ApiProperty({ example: 50000.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

