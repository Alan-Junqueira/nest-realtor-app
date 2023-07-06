import { Body, Controller, HttpCode, Param, ParseEnumPipe, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateProductKeyDTO, SignInDTO, SignUpDTO } from 'src/dtos/auth.dto';
import { UserType } from '@prisma/client';
import { compare } from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup/:userType')
  signUp(
    @Body() body: SignUpDTO,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType
  ) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey) {
        throw new UnauthorizedException()
      }
      console.log('entrou')

      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`
      const isValidProductKey = compare(validProductKey, body.productKey)

      if (!isValidProductKey) {
        throw new UnauthorizedException()
      }
    }

    return this.authService.signUp({ ...body, userType })
  }

  @HttpCode(200)
  @Post('/signin')
  signIn(
    @Body() body: SignInDTO
  ) {
    return this.authService.signIn(body)
  }

  @Post("key")
  generateProductKey(
    @Body() body: GenerateProductKeyDTO
  ) {
    return this.authService.generateProductKey(body)
  }
}
