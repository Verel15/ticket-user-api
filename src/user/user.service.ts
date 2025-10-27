import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { SaveAppLog } from '../utils/logger';
import { RegisterDto } from './dto/register.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import sha1 from 'crypto-js/sha1';
import { EStatus } from '../enum/user';
import { LoginDto } from './dto/login.dto';
import { CompanyUserEntity } from '../database/entities/company-user.entity';

@Injectable()
export class UserService {
  private readonly logger = new SaveAppLog(UserService.name);
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async register(body: RegisterDto) {
    try {
      const uuid = uuidv4();

      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u."emailHash" = :email`, { email: sha1(body.email) })
        .andWhere(`u.status = :status`, { status: EStatus.ACTIVE })
        .select([`u.uuid AS uuid`])
        .getRawOne();

      if (user) {
        return null;
      }

      await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values([
          {
            uuid,
            email: () =>
              `pgp_sym_encrypt('${body.email}', '${this.configService.get('ENCRYPTION_KEY')}')`,
            emailHash: sha1(body.email),
            displayName: body.displayName || null,
            password: sha1(body.password),
          },
        ])
        .execute();

      return uuid;
    } catch (error: any) {
      this.logger.error(error.message, error.stack, this.register.name);
      throw new Error(error);
    }
  }

  async login(body: LoginDto) {
    try {
      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u."emailHash" = :email`, { email: sha1(body.email) })
        .andWhere(`u.password = :password`, { password: sha1(body.password) })
        .andWhere(`u.status = :status`, { status: EStatus.ACTIVE })
        .innerJoin(CompanyUserEntity, `cu`, `u.uuid = cu.user_uuid`)
        .useIndex(`users_emailHash_idx`)
        .select([`u.uuid AS uuid`, `cu.company_uuid AS company_uuid`])
        .getRawOne();

      return user;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.login.name);
    }
  }
}
