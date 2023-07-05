import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDTO } from 'src/dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  @Post('/signup')
  signUp(
    @Body() body: SignUpDTO
  ) {
    return this.authService.signUp()
  }
}
