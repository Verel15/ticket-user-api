import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'Email user login' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Password user login' })
  password: string;
}
