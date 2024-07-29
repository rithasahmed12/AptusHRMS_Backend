import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';

@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
      next();
    } else {
      bodyParser.json()(req, res, next);
    }
  }
}