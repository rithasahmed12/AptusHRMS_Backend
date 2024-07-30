import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof MongoError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database error occurred';
      
      // Handle MongoDB errors
      if (exception.code === 11000) {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate key error';
      }
    } else if (exception instanceof MongooseError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;

      // Handle Mongoose errors
      if (exception instanceof MongooseError.ValidationError) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Validation error';
      } else if (exception instanceof MongooseError.CastError) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid ID';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}