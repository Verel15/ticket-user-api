import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { UserEntity } from './user.entity';
import { GroupEntity } from './group.entity';
import { EStatus } from '../../enum/common';

@Entity({ name: `user_group` })
export class UserGroupEntity extends TemplateEntity {
  @Column({
    type: 'enum',
    enum: EStatus,
    default: EStatus.ACTIVE,
  })
  status: EStatus;

  @ManyToOne(() => UserEntity, (user) => user.groupUser)
  @JoinColumn({ name: 'user_uuid' })
  user_uuid: string;

  @ManyToOne(() => GroupEntity, (group) => group.groupUser)
  @JoinColumn({ name: 'group_uuid' })
  group_uuid: string;
}
