import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import checkOrigin from './checkOrigin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{bodyParser:false});

  app.use(cookieParser());
  app.enableCors({
    origin: checkOrigin, // Use the custom function to check allowed origins
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001);
}
bootstrap();
