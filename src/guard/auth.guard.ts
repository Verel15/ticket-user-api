import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SaveAppLog } from '../utils/logger';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new SaveAppLog(AuthGuard.name);

  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header is missing or malformed.',
      );
    }
    try {
      const instance = axios.create({
        baseURL: this.configService.get<string>('CREDENTIAL_API'),
        headers: {
          Authorization: authHeader,
        },
      });
      const response = await instance.get(`/api/v1/credential/verify`);
      request.user = response.data.data;
      return true;
    } catch (error: any) {
      this.logger.error(error.message, error.stack, this.canActivate.name);
      return false;
    }
  }
}
