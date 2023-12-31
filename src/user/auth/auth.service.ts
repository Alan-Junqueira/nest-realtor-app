import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import * as JWT from "jsonwebtoken"

interface ISignUpParams {
  email: string
  password: string
  name: string
  phone_number: string
  userType: UserType
}

interface ISignInParams {
  email: string
  password: string
}

interface IGenerateJWT {
  id: string
  name: string
}

interface IGenerateProductKey {
  email: string
  userType: UserType
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) { }
  async signUp({
    email,
    name,
    password,
    phone_number,
    userType
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
        user_type:userType
      }
    })

    const token = this.generateJWT({
      id: user.id,
      name
    })

    return { token }
  }

  async signIn({
    email,
    password
  }: ISignInParams) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email
      }
    })

    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const isValidPassword = await compare(password, user.password)

    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const token = this.generateJWT({
      id: user.id,
      name: user.name
    })

    return { token }
  }

  private generateJWT({
    id,
    name
  }: IGenerateJWT) {
    const token = JWT.sign({
      name,
      id
    }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    })

    return token
  }

  async generateProductKey({
    email,
    userType
  }: IGenerateProductKey) {
    const productKeyBase = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`

    const key = await hash(productKeyBase, 10)

    return { key }
  }
}
