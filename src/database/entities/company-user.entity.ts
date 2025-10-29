import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { CompanyEntity } from './company.entity';
import { UserEntity } from './user.entity';
import { EStatus } from '../../enum/common';

@Entity({ name: 'company_user' })
export class CompanyUserEntity extends TemplateEntity {
  @Column({ type: 'enum', enum: EStatus, nullable: true })
  status: EStatus;

  @ManyToOne(() => CompanyEntity, (company) => company.company_user)
  @Index(`company_user_company_idx`)
  @JoinColumn({ name: 'company_uuid' })
  company_uuid: string;

  @ManyToOne(() => UserEntity, (user) => user.companyUser)
  @JoinColumn({ name: 'user_uuid' })
  user_uuid: string;
}
