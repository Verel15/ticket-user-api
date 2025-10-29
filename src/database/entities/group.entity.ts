import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { CompanyEntity } from './company.entity';
import { EStatus } from '../../enum/common';

@Entity({ name: 'group' })
export class GroupEntity extends TemplateEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: EStatus, default: EStatus.ACTIVE })
  status: EStatus;

  @ManyToOne(() => CompanyEntity, (company) => company.company_group)
  @JoinColumn({ name: 'company_uuid' })
  @Index(`group_company_idx`)
  company_uuid: string;
}
