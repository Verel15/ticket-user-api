import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'providers' })
export class UserProvider extends TemplateEntity {
  @Column({ type: 'bytea' })
  value: string;

  @Column({ type: 'varchar' })
  provider: string; // line, user, any

  @ManyToOne(() => UserEntity, (user) => user.providers)
  @JoinColumn({ name: 'user_uuid' })
  user_uuid: string;
}
