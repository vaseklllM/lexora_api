import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  login(loginDto: LoginDto) {
    return 'Login : ' + loginDto.email;
  }

  register(registerDto: RegisterDto) {
    return 'Register: ' + registerDto.email;
  }
}
