import { Column, Entity, OneToMany } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { CompanyUserEntity } from './company-user.entity';

@Entity({ name: 'company' })
export class CompanyEntity extends TemplateEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  telephone: string;

  @OneToMany(() => CompanyUserEntity, (companyUser) => companyUser.company_uuid)
  company_user: CompanyUserEntity[];
}
