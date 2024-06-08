import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req:Request) {
    var domain = req.get('host').match(/\w+/); // e.g., host: "subdomain.website.com"
    if (domain)
       var subdomain = domain[0]; // Use "subdomain"
      console.log(domain,subdomain);
      
  }
}
