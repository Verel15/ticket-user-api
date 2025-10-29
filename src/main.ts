/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SaveAppLog } from './utils/logger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExceptionHandle } from './utils/exceptionHandler';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new SaveAppLog(AppModule.name),
  });

  process.env.TZ = 'Asia/Bangkok';
  app.setGlobalPrefix('/api/v1');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());

  app.useGlobalFilters(
    new ExceptionHandle(new SaveAppLog('GlobalExceptionHandle')),
  );
  const config = new DocumentBuilder()
    .setTitle('User API')
    .setDescription('The API for user and admin management.')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);

  Logger.log(
    `Application is running on: ${process.env.PORT ?? 3000}`,
    'bootstrap',
  );
}
bootstrap();
