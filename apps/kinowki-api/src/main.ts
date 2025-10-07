/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const url = new URL(process.env.FRONTEND_URL);
  const origin = [process.env.FRONTEND_URL, `${url.protocol}//www.${url.hostname}`];

  app.enableCors({
    origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;

  await app.listen(port);
  Logger.log(`🚀 Application is running on ${process.env.RAILWAY_PUBLIC_DOMAIN}`);
}

bootstrap();
