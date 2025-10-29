import { CategoryEntity } from './category.entity';
import { CompanyUserEntity } from './company-user.entity';
import { CompanyEntity } from './company.entity';
import { GroupEntity } from './group.entity';
import { UserGroupEntity } from './user-group.entity';
import { UserEntity } from './user.entity';
import { UserProvider } from './userProvider.entity';

const entities = [
  UserEntity,
  UserProvider,
  CompanyEntity,
  CompanyUserEntity,
  CategoryEntity,
  GroupEntity,
  UserGroupEntity,
];

export default entities;
