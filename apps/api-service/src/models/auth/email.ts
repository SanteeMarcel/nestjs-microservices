import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class Email {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}
