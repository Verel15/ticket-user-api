import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { UserProvider } from '../database/entities/userProvider.entity';
import { CredentialModule } from '../credential/credential.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserProvider]),
    CredentialModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
