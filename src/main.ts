// src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const config = new DocumentBuilder()
    .setTitle('Folocom API')
    .setDescription('The Folocom marketplace API for spare parts')
    .setVersion('1.0')
    .addTag('spare-parts')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      "https://folocom.onrender.com"
   
    ],
    credentials: true, // Allow cookies or authorization headers
  });

  await app.listen(3000);
}
bootstrap();
