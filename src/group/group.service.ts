import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from '../database/entities/group.entity';
import { Repository } from 'typeorm';
import { SaveAppLog } from '../utils/logger';
import { CreateGroupDto } from './dto/createGroup.dto';
import { EStatus } from '../enum/common';
import { ICurrentUser } from '../current-user/current-user.decorator';

@Injectable()
export class GroupService {
  private readonly logger = new SaveAppLog(GroupService.name);

  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
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
        .createQueryBuilder(`g`)
        .update()
        .set(update)
        .where(`g.uuid = :uuid`, { uuid })
        .andWhere(`g.company = :company`, { company: user.company })
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
        .createQueryBuilder(`g`)
        .update()
        .set({
          status: EStatus.ARCHIVED,
          archivedBy: user.uuid,
        })
        .where(`g.uuid = :uuid`, { uuid })
        .andWhere(`g.company_uuid = :company`, { company: user.company })
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
}
