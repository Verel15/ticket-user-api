import { Column, Entity, OneToMany } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { CompanyUserEntity } from './company-user.entity';
import { CategoryEntity } from './category.entity';
import { GroupEntity } from './group.entity';
import { EStatus } from '../../enum/common';

@Entity({ name: 'company' })
export class CompanyEntity extends TemplateEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  telephone: string;

  @Column({ type: 'varchar', nullable: true })
  webSite: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: EStatus, default: EStatus.ACTIVE })
  status: EStatus;

  @OneToMany(() => CompanyUserEntity, (companyUser) => companyUser.company_uuid)
  company_user: CompanyUserEntity[];

  @OneToMany(() => CategoryEntity, (category) => category.company_uuid)
  company_category: CategoryEntity[];

  @OneToMany(() => GroupEntity, (group) => group.company_uuid)
  company_group: GroupEntity[];
}
