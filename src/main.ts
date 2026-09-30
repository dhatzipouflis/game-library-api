import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import open from 'open';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Game Library API')
    .setDescription('REST API for managing a personal game library.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Games')
    .addTag('Auth')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port);

  if (process.env.NODE_ENV !== 'production') {
    await open(`http://localhost:${port}/api`);
  }
}

await bootstrap();
