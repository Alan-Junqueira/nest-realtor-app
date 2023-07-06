import { UserType } from "@prisma/client"
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator"

export class SignUpDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsPhoneNumber()
  phone_number: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(5)
  password: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productKey?: string
}

export class SignInDTO {
  @IsEmail()
  email: string

  @IsString()
  password
}

export class GenerateProductKeyDTO {
  @IsEmail()
  email: string

  @IsEnum(UserType)
  userType: UserType
}