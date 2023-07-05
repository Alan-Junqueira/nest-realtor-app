import { ConflictException, Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import * as JWT from "jsonwebtoken"

interface ISignUpParams {
  email: string
  password: string
  name: string
  phone_number: string
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) { }
  async signUp({
    email,
    name,
    password,
    phone_number
  }: ISignUpParams) {
    const existentUser = await this.prismaService.user.findUnique({
      where: {
        email
      }
    })

    if (existentUser) {
      throw new ConflictException()
    }

    const hashedPassword = await hash(password, 10)

    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone_number,
        user_type: UserType.BUYER
      }
    })

    const token = await JWT.sign({
      name,
      id: user.id
    }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    })

    return { token }
  }
}
