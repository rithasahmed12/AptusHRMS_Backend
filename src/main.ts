import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Body, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { GlobalExceptionFilter } from './filters/global-exception.filters';



async function bootstrap() {
  const app = await NestFactory.create(AppModule,{rawBody:true});
  // Body

  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  }));

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        /^https?:\/\/(.+\.)?shoetopia\.site$/, 
        /^http:\/\/(.+\.)?localhost:3000$/,    
        'https://shoetopia.site'                
      ];
      
      const allowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return origin === allowedOrigin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
      });
      
      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  };

  app.use(cookieParser());
  app.enableCors(corsOptions);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001);
}
bootstrap();
