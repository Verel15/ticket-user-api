import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from '../database/entities/group.entity';
import { UserGroupEntity } from '../database/entities/user-group.entity';
import { UserEntity } from '../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEntity, UserGroupEntity, UserEntity]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
