import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { SaveAppLog } from '../utils/logger';
@Injectable()
export class CredentialService {
  private readonly logger = new SaveAppLog(CredentialService.name);
  private instance: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.instance = axios.create({
      baseURL: configService.get<string>('CREDENTIAL_API'),
    });
  }

  async signJwt(payload: any) {
    try {
      const response = await this.instance.post(`/api/v1/credential`, payload);
      return response.data;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.signJwt.name, payload);
    }
  }
}
