import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  displayName: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  termCondition: boolean;
}
