import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/adminlogin.dto';


@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService){}

    @Post('login')
    adminLogin(@Body() adminLoginDto:AdminLoginDto){
        return this.adminService.adminLogin(adminLoginDto); 
    }
}
