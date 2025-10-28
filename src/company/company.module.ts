import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../database/entities/company.entity';
import { CompanyUserEntity } from '../database/entities/company-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity, CompanyUserEntity])],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
