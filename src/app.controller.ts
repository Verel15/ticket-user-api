import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SaveAppLog } from './utils/logger';

@Controller()
export class AppController {
  private readonly logger = new SaveAppLog(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    try {
      this.logger.log(`login success`, this.getHello.name, { userId: 123 });

      this.logger.debug(`Debug : `, { a: 1, b: 'string', c: false });
      return this.appService.getHello();
    } catch (error) {
      this.logger.error(error.message, error.stack, this.getHello.name);
    }
  }
}
