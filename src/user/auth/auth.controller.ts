import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDTO, SignUpDTO } from 'src/dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  signUp(
    @Body() body: SignUpDTO
  ) {
    return this.authService.signUp(body)
  }

  @HttpCode(200)
  @Post('/signin')
  signIn(
    @Body() body: SignInDTO
  ) {
    return this.authService.signIn(body)
  }
}
