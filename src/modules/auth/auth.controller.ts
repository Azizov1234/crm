import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post("login/users")
    async loginUser(@Body() payload: LoginDto){
        return this.authService.loginUsers(payload)
    }
    @Post("login/teachers")
    loginTeachers(@Body() payload:LoginDto){
        return this.authService.loginTeachers(payload)
    }
    @Post("login/students")
     loginStudents(@Body() payload:LoginDto){
        return this.authService.loginStudents(payload)
    }

}
