import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class StockHistory {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  date: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  symbol: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  open: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  close: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  high: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  low: number;
}
