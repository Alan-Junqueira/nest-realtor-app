import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from "class-validator"

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
  password
}