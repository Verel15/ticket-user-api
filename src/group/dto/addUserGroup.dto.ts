import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class AddUserGroupDto {
  @ApiProperty()
  @IsArray()
  users: string[];
}
