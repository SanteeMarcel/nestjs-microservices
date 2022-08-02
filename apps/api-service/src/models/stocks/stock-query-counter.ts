import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class StockQueryCounter {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  stock: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  times_requested: number;
}
