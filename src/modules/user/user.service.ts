import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {

    async register(signup:any){
        return signup;
    }
}
