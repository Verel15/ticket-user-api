import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class InviteDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  group: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
