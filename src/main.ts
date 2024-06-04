import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{bodyParser:false});

  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:5173', // Your frontend origin
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001);
}
bootstrap();
