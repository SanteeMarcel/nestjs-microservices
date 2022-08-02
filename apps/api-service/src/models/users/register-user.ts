import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from './role.enum';
export class RegisterUser {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsEnum(Role)
  @ApiProperty({
    type: String,
    example: Object.keys(Role)
      .map((key) => Role[key])
      .join(' or '),
  })
  role: Role;
}
