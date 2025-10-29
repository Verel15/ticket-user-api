import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity } from '../database/entities/company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/createCompany.dto';
import { SaveAppLog } from '../utils/logger';
import { CompanyUserEntity } from '../database/entities/company-user.entity';
import { EStatus } from '../enum/common';

@Injectable()
export class CompanyService {
  private readonly logger = new SaveAppLog(CompanyService.name);
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepoSitory: Repository<CompanyEntity>,

    @InjectRepository(CompanyUserEntity)
    private readonly companyUserRepository: Repository<CompanyUserEntity>,
  ) {}

  async create(body: CreateCompanyDto, userId: string) {
    try {
      const company = await this.companyRepoSitory
        .createQueryBuilder()
        .insert()
        .into(CompanyEntity)
        .values([
          {
            name: body.name,
            address: body.address,
            telephone: body.telephone,
            email: body.email,
            city: body.city,
            state: body.state,
            country: body.country,
            postalCode: body.postalCode,
            description: body.description,
            createdBy: userId,
          },
        ])
        .execute();

      this.logger.debug(company.raw);
      await this.companyUserRepository
        .createQueryBuilder()
        .insert()
        .into(CompanyUserEntity)
        .values([
          {
            company_uuid: company.raw[0].uuid,
            user_uuid: userId,
          },
        ])
        .execute();

      this.logger.log(`create company completed`, this.create.name, {
        name: body.name,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.create.name);
      throw new Error(error);
    }
  }

  async update(body: CreateCompanyDto, uuid: string, userId: string) {
    try {
      await this.companyRepoSitory
        .createQueryBuilder()
        .update()
        .set({
          name: body.name,
          address: body.address,
          telephone: body.telephone,
          email: body.email,
          city: body.city,
          state: body.state,
          country: body.country,
          postalCode: body.postalCode,
          description: body.description,
          updatedBy: userId,
        })
        .where(`uuid = :uuid`, { uuid })
        .execute();
      this.logger.log(`update company completed`, this.create.name, {
        name: body.name,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.create.name);
    }
  }

  async delete(uuid: string, userId: string) {
    try {
      const company = await this.companyRepoSitory
        .createQueryBuilder(`c`)
        .innerJoin(CompanyUserEntity, `cu`, `c.uuid = cu.company_uuid`)
        .where(`c.uuid = :uuid`, { uuid })
        .andWhere(`cu.user_uuid = :user`, { user: userId })
        .select([`c.uuid AS uuid`])
        .getRawOne();

      if (!company) {
        return null;
      }

      await this.companyRepoSitory
        .createQueryBuilder()
        .update()
        .where(`uuid = :uuid`, { uuid })
        .set({ status: EStatus.ARCHIVED, archivedAt: new Date() })
        .execute();

      this.logger.log(`delete company completed`, this.delete.name, {
        user: userId,
      });
      return company.uuid;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.delete.name);
    }
  }
}
