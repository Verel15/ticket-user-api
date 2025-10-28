import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  telephone: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  city: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  state: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  postalCode: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  country: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  description: string;
}
