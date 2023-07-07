import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export interface IUserFromToken {
  name: string
  id: string
  iat: number
  exp: number
}

export const User = createParamDecorator((_data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest()
  return request.user
})