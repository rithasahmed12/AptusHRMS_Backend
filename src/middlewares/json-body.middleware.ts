import type { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: () => any) {
        if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
            next();
        } else {
            bodyParser.json()(req, res, next);
        }
    }
}