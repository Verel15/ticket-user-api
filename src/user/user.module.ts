import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { UserProvider } from '../database/entities/userProvider.entity';
import { CredentialModule } from '../credential/credential.module';
import { CompanyUserEntity } from '../database/entities/company-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserProvider, CompanyUserEntity]),
    CredentialModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
