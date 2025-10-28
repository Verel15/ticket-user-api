import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { SaveAppLog } from '../utils/logger';
import httpStatus from 'http-status';
import type { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { CredentialService } from '../credential/credential.service';

@Controller('/user')
@ApiTags('user')
export class UserController {
  private readonly logger = new SaveAppLog(UserController.name);
  constructor(
    private readonly userService: UserService,
    private readonly credentialService: CredentialService,
  ) {}

  @Post('/register')
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    try {
      const results = await this.userService.register(body);

      if (results === null) {
        this.logger.log(`user already exist`, this.register.name, {
          email: body.email,
        });
        res.status(httpStatus.BAD_REQUEST);
        res.json({ success: false, message: `User already exist.` });
        return;
      }
      res.json({ success: true, message: `Register completed.` });
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Post('/login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const user = await this.userService.login(body);
      if (!user) {
        this.logger.log(`login fail`, this.login.name, {
          username: body.email,
        });
        res.status(httpStatus.BAD_REQUEST);
        res.json({
          success: false,
          message: `Username or password incorrect.`,
        });
        return;
      }
      const jwt = await this.credentialService.signJwt(user);
      this.logger.log(`login completed`, this.login.name, {
        username: body.email,
        company: user.company,
      });
      res.status(httpStatus.OK);
      res.json({ success: true, data: jwt.data });
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }
}
