import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from '../database/entities/group.entity';
import { Repository } from 'typeorm';
import { SaveAppLog } from '../utils/logger';
import { CreateGroupDto } from './dto/createGroup.dto';
import { EStatus } from '../enum/common';
import { EStatusProcess } from '../enum/group';
import { ICurrentUser } from '../current-user/current-user.decorator';
import { UserGroupEntity } from '../database/entities/user-group.entity';
import { UserEntity } from '../database/entities/user.entity';
import { CompanyUserEntity } from '../database/entities/company-user.entity';

@Injectable()
export class GroupService {
  private readonly logger = new SaveAppLog(GroupService.name);

  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,

    @InjectRepository(UserGroupEntity)
    private readonly userGroupRepository: Repository<UserGroupEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createGroup(body: CreateGroupDto, company: string, userId: string) {
    try {
      const result = await this.groupRepository
        .createQueryBuilder()
        .insert()
        .into(GroupEntity)
        .values([
          {
            name: body.name,
            description: body.description,
            company_uuid: company,
            createdBy: userId,
          },
        ])
        .execute();

      return result.raw[0];
    } catch (error) {
      this.logger.error(error.message, error.stack, this.createGroup.name, {
        body,
      });
    }
  }

  async listGroup(company: string, page: number, limit: number) {
    try {
      const query = this.groupRepository
        .createQueryBuilder(`g`)
        .where(`g.company_uuid = :company`, { company })
        .andWhere(`g.status = :status`, { status: EStatus.ACTIVE });

      const [data, count] = await Promise.all([
        query
          .select([
            `g.uuid AS uuid`,
            `g.name AS name`,
            `g.description AS description`,
          ])
          .useIndex(`group_company_idx`)
          .offset((page - 1) * limit)
          .limit(limit)
          .getRawMany(),
        query.getCount(),
      ]);
      this.logger.log(`list group completed`, this.listGroup.name, {
        company,
        page,
        limit,
      });

      return { data, count };
    } catch (error) {
      this.logger.error(error.message, error.stack, this.listGroup.name, {
        company,
        page,
        limit,
      });
      throw new Error(error);
    }
  }

  async updateGroup(body: CreateGroupDto, uuid: string, user: ICurrentUser) {
    try {
      const update = {};

      Object.assign(update, { ...body, updatedBy: user.uuid });
      await this.groupRepository
        .createQueryBuilder()
        .update()
        .set(update)
        .where(`uuid = :uuid`, { uuid })
        .andWhere(`company_uuid = :company`, { company: user.company })
        .execute();

      this.logger.log(`update group completed`, this.updateGroup.name, {
        uuid,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.updateGroup.name, {
        body,
      });
      throw new Error(error);
    }
  }

  async deleteGroup(uuid: string, user: ICurrentUser) {
    try {
      await this.groupRepository
        .createQueryBuilder()
        .update()
        .set({
          status: EStatus.ARCHIVED,
          archivedBy: user.uuid,
          archivedAt: new Date(),
        })
        .where(`uuid = :uuid`, { uuid })
        .andWhere(`company_uuid = :company`, { company: user.company })
        .execute();
      this.logger.log(`delete group completed`, this.deleteGroup.name, {
        uuid,
        user: user.uuid,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.deleteGroup.name, {
        uuid,
        user: user.uuid,
        company: user.company,
      });
      throw new Error(error);
    }
  }

  async addUser(uuid: string, userId: string[], userInfo: ICurrentUser) {
    try {
      const noActiveUser = await this.userRepository
        .createQueryBuilder(`u`)
        .where(`u.uuid IN(:...id)`, { id: userId })
        .andWhere(`u.status != :status`, { status: EStatus.ACTIVE })
        .getOne();

      if (noActiveUser) {
        throw new Error(`Some user not active`);
      }

      const checkExistPermission = await this.userRepository
        .createQueryBuilder(`u`)
        .innerJoin(CompanyUserEntity, `cu`, `u.uuid = cu.user_uuid`)
        .innerJoin(GroupEntity, `g`, `g.company_uuid = cu.company_uuid`)
        .where(`g.uuid = :uuid`, { uuid })
        .andWhere(`cu.company_uuid = :company`, { company: userInfo.company })
        .andWhere(`cu.status = :status`, { status: EStatus.ACTIVE })
        .getCount();

      if (checkExistPermission === 0) {
        throw new Error(`Invalid user invite company group`);
      }

      const aleadyInGroup = await this.userGroupRepository
        .createQueryBuilder(`ug`)
        .where(`ug.user_uuid IN(:...id)`, { id: userId })
        .andWhere(`ug.status = :status`, { status: EStatusProcess.ACTIVE })
        .andWhere(`ug.group_uuid = :group`, { group: uuid })
        .getCount();

      if (aleadyInGroup !== 0) {
        throw new Error(`Some user already in company group`);
      }

      const inserts: any = [];
      for (const item of userId) {
        inserts.push({
          status: EStatusProcess.ACTIVE,
          user_uuid: item,
          group_uuid: uuid,
          createdBy: userInfo.uuid,
        });
      }

      await this.userGroupRepository
        .createQueryBuilder()
        .insert()
        .into(UserGroupEntity)
        .values(inserts)
        .execute();

      this.logger.log(`invite user completed`, this.addUser.name);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
