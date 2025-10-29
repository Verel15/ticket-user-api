import { Column, Entity, Index, OneToMany } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { EStatus } from '../../enum/user';
import { UserProvider } from './userProvider.entity';
import { CompanyUserEntity } from './company-user.entity';
import { UserGroupEntity } from './user-group.entity';

@Entity({ name: 'users' })
export class UserEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  displayName?: string | null;

  @Column({ type: 'bytea', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  @Index('users_emailHash_idx')
  emailHash: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ type: 'boolean' })
  agreeTermsPolicy: boolean;

  @Column({ type: 'enum', enum: EStatus, default: EStatus.ACTIVE })
  status: EStatus;

  @OneToMany(() => UserProvider, (provider) => provider.user_uuid)
  providers: UserProvider[];

  @OneToMany(() => CompanyUserEntity, (companyUser) => companyUser.user_uuid)
  companyUser: CompanyUserEntity[];

  @OneToMany(() => UserGroupEntity, (usergroup) => usergroup.user_uuid)
  groupUser: UserGroupEntity[];
}
