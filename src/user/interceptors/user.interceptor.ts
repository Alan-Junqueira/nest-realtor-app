import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import * as JWT from 'jsonwebtoken'

export class UserInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest()

    const token = request?.headers?.authorization?.split('Bearer ')[1]

    const user = await JWT.decode(token)
    
    request.user = user

    return next.handle()
  }

}