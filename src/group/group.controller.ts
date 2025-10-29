import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';
import {
  CurrentUser,
  type ICurrentUser,
} from '../current-user/current-user.decorator';
import type { Response } from 'express';
import { SaveAppLog } from '../utils/logger';
import { CreateGroupDto } from './dto/createGroup.dto';
import { GroupService } from './group.service';
import httpStatus from 'http-status';

@ApiTags('Group')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('/group')
export class GroupController {
  private readonly logger = new SaveAppLog(GroupController.name);

  constructor(private readonly groupService: GroupService) {}

  @Post('/')
  async create(
    @CurrentUser() user: ICurrentUser,
    @Body() body: CreateGroupDto,
    @Res() res: Response,
  ) {
    try {
      const results = await this.groupService.createGroup(
        body,
        user.company,
        user.uuid,
      );

      if (!results) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR);
        res.json({ success: false, message: `Cant't create group` });
        return;
      }
      res.json({ success: true, message: `Create group completed.` });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.create.name);
      res.json({ success: false });
    }
  }

  @Get('/')
  async listGroup(
    @CurrentUser() user: ICurrentUser,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ) {
    try {
      const result = await this.groupService.listGroup(
        user.company,
        page,
        limit,
      );
      res.json({
        success: true,
        message: `List group completed.`,
        data: {
          rowCount: result.count,
          data: result.data,
        },
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.listGroup.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: `Fail to fetch group.` });
    }
  }

  @Put('/:id')
  async updateGroup(
    @CurrentUser() user: ICurrentUser,
    @Param('id') uuid: string,
    @Body() body: CreateGroupDto,
    @Res() res: Response,
  ) {
    try {
      await this.groupService.updateGroup(body, uuid, user);
      res.json({ success: true, message: `Update group success.` });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.updateGroup.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: `Fail to update group.` });
    }
  }

  @Delete('/:id')
  async deleteGroup(
    @CurrentUser() user: ICurrentUser,
    @Param('id') uuid: string,
    @Res() res: Response,
  ) {
    try {
      await this.groupService.deleteGroup(uuid, user);
      res.json({ success: true, message: `Delete group completed` });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.deleteGroup.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: `Fail to delete group` });
    }
  }
}
