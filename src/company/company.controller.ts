import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import httpStatus from 'http-status';
import type { Response } from 'express';
import { SaveAppLog } from '../utils/logger';
import { AuthGuard } from '../guard/auth.guard';
import { CreateCompanyDto } from './dto/createCompany.dto';
import { CompanyService } from './company.service';
import { CurrentUser } from '../current-user/current-user.decorator';
import type { ICurrentUser } from '../current-user/current-user.decorator';

@ApiTags('company')
@UseGuards(AuthGuard)
@Controller('/company')
export class CompanyController {
  private readonly logger = new SaveAppLog(CompanyController.name);
  constructor(private readonly companyService: CompanyService) {}
  @Post('/')
  async create(
    @CurrentUser() user: ICurrentUser,
    @Body() body: CreateCompanyDto,
    @Res() res: Response,
  ) {
    try {
      this.logger.debug({ user });
      await this.companyService.create(body, user.uuid);
      res.status(httpStatus.OK);
      res.json({ success: true, message: `Create company completed.` });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Put('/:id')
  async update(
    @CurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Body() body: CreateCompanyDto,
    @Res() res: Response,
  ) {
    try {
      await this.companyService.update(body, id, user.uuid);
      res.status(httpStatus.OK);
      res.json({ success: true, message: `Update company completed.` });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.update.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/:id')
  async delete(
    @CurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const company_uuid = await this.companyService.delete(id, user.uuid);

      if (!company_uuid) {
        res.json({
          success: false,
          message: `Company not allow this user delete`,
        });
        return;
      }
      res.status(httpStatus.OK);
      res.json({ success: true });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.delete.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
