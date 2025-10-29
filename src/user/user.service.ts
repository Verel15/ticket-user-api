import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { SaveAppLog } from '../utils/logger';
import { RegisterDto } from './dto/register.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { enc } from 'crypto-js';
import sha1 from 'crypto-js/sha1';
import { EStatus as commonStatus } from '../enum/common';
import { LoginDto } from './dto/login.dto';
import { CompanyUserEntity } from '../database/entities/company-user.entity';
import { InviteDto } from './dto/invite.dto';
import { ICurrentUser } from '../current-user/current-user.decorator';
import { UserGroupEntity } from '../database/entities/user-group.entity';
import { GroupEntity } from '../database/entities/group.entity';

@Injectable()
export class UserService {
  private readonly logger = new SaveAppLog(UserService.name);
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(CompanyUserEntity)
    private readonly companyUserRepository: Repository<CompanyUserEntity>,

    @InjectRepository(UserGroupEntity)
    private readonly userGroupRepository: Repository<UserGroupEntity>,
  ) {}

  async register(body: RegisterDto) {
    try {
      const uuid = uuidv4();

      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u."emailHash" = :email`, {
          email: sha1(body.email).toString(enc.Hex),
        })
        .andWhere(`u.status = :status`, { status: commonStatus.ACTIVE })
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
            emailHash: sha1(body.email).toString(enc.Hex),
            displayName: body?.displayName || null,
            password: sha1(body.password).toString(enc.Hex),
            agreeTermsPolicy: body.termCondition,
          },
        ])
        .execute();

      this.logger.log(`register completed`, this.register.name, {
        email: body.email,
      });
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
        .where(`u."emailHash" = :email`, {
          email: sha1(body.email).toString(enc.Hex),
        })
        .andWhere(`u.password = :password`, {
          password: sha1(body.password).toString(enc.Hex),
        })
        .andWhere(`u.status = :status`, { status: commonStatus.ACTIVE })
        .useIndex(`users_emailHash_idx`)
        .select([`u.uuid AS uuid`])
        .getRawOne();

      if (!user) {
        return null;
      }
      const company = await this.companyUserRepository
        .createQueryBuilder(`cu`)
        .where(`cu.user_uuid = :uuid`, { uuid: user.uuid })
        .select(`cu.company_uuid AS company_uuid`)
        .getRawOne();

      const userObj = { uuid: '', company: null };
      Object.assign(userObj, {
        uuid: user.uuid,
        company: company?.company_uuid || null,
      });
      return userObj;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.login.name);
    }
  }

  async inviteUser(body: InviteDto, userInfo: ICurrentUser) {
    try {
      const existInvite = await this.companyUserRepository
        .createQueryBuilder(`cu`)
        .innerJoin(UserEntity, `u`, `u.uuid = cu.user_uuid`)
        .where(`cu.company_uuid = :company`, { company: userInfo.company })
        .andWhere(`u."emailHash" = :email`, {
          email: sha1(body.email).toString(enc.Hex),
        })
        .andWhere(`cu.status != :status`, { status: commonStatus.ARCHIVED })
        .getCount();

      if (existInvite !== 0) {
        throw new Error(`Invite already exist`);
      }
      const user = await this.userRepository
        .createQueryBuilder(`u`)
        .innerJoin(CompanyUserEntity, `cu`, `cu.user_uuid = u.uuid`)
        .where(`u."emailHash" = :email`, {
          email: sha1(body.email).toString(enc.Hex),
        })
        .andWhere(`cu.company_uuid = :company`, { company: userInfo.company })
        .andWhere(`cu.status = :status`, { status: commonStatus.ACTIVE })
        .select([
          `cu.company_uuid AS company_uuid`,
          `cu.user_uuid AS user_uuid`,
        ])
        .getRawOne();

      if (user) {
        throw new Error(`User already exist in company`);
      }

      const newUser = await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values([
          {
            email: () =>
              `pgp_sym_encrypt('${body.email}', '${this.configService.get('ENCRYPTION_KEY')}')`,
            emailHash: sha1(body.email).toString(enc.Hex),
            displayName: null,
            password: null,
            agreeTermsPolicy: false,
            status: commonStatus.PENDING,
          },
        ])
        .execute();

      await this.userGroupRepository
        .createQueryBuilder()
        .insert()
        .into(UserGroupEntity)
        .values([
          {
            group_uuid: body.group,
            user_uuid: newUser.raw[0].uuid,
            status: commonStatus.PENDING,
            createdBy: userInfo.uuid,
          },
        ])
        .execute();

      await this.companyUserRepository
        .createQueryBuilder()
        .insert()
        .into(CompanyUserEntity)
        .values([
          {
            status: commonStatus.PENDING,
            company_uuid: userInfo.company,
            user_uuid: newUser.raw[0].uuid,
          },
        ])
        .execute();
    } catch (error) {
      this.logger.error(error.message, error.stack, this.inviteUser.name);
      throw new Error(error.message);
    }
  }

  async listInvite(page: number, limit: number, user: ICurrentUser) {
    try {
      const invites = await this.companyUserRepository
        .createQueryBuilder(`cu`)
        .innerJoin(UserEntity, `u`, `u.uuid = cu.user_uuid`)
        .innerJoin(UserGroupEntity, `ug`, `u.uuid = ug.user_uuid`)
        .innerJoin(GroupEntity, `g`, `g.uuid = ug.group_uuid`)
        .where(`cu.company_uuid = :company`, { company: user.company })
        .andWhere(`u.status != :user_status`, {
          user_status: commonStatus.ACTIVE,
        })
        .andWhere(`cu.status IN(:...status) `, {
          status: [commonStatus.PENDING],
        })
        .select([
          `u.uuid AS uuid`,
          `pgp_sym_decrypt(u.email , '${this.configService.get('ENCRYPTION_KEY')}') AS email`,
          `g.name AS "groupName"`,
          `u.status AS status`,
        ])
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

      const count = await this.companyUserRepository
        .createQueryBuilder(`cu`)
        .where(`cu.company_uuid = :company`, { company: user.company })
        .andWhere(`cu.status IN(:...status) `, {
          status: [commonStatus.PENDING],
        })
        .getCount();
      return { data: invites, count };
    } catch (error) {
      this.logger.error(error.message, error.stack, this.listInvite.name);
      throw new Error(error);
    }
  }
}
