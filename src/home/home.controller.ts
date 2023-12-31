import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query, UnauthorizedException } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDTO, HomeResponseDTO, InquireDTO, UpdateHomeDTO } from 'src/dtos/home.dto';
import { PropertyType, UserType } from '@prisma/client';
import { IUserFromToken, User } from 'src/user/decorators/user.decorator';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) { }

  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDTO[]> {
    const price = minPrice || maxPrice ? {
      ...(minPrice && { gte: parseFloat(minPrice) }),
      ...(maxPrice && { lte: parseFloat(maxPrice) }),
    } : undefined

    const filters = {
      ...(city && { city }),
      ...(propertyType && { property_type: propertyType }),
      ...(price && { price })
    }

    return this.homeService.getHomes(filters)
  }

  @Get(":id")
  getHome(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.homeService.getHome(id)
  }

  @Roles(UserType.REALTOR, UserType.ADMIN)
  @Post()
  @HttpCode(201)
  createHome(
    @Body() body: CreateHomeDTO,
    @User() user: IUserFromToken
  ) {
    return this.homeService.createHome({ ...body, realtorId: user.id })
  }

  @Roles(UserType.REALTOR, UserType.ADMIN)
  @Put(":id")
  async updateHome(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateHomeDTO,
    @User() user: IUserFromToken
  ) {
    if (!user) {
      throw new UnauthorizedException()
    }

    const realtor = await this.homeService.getRealtorByHomeId(id)

    if (realtor.id !== user.id) {
      throw new UnauthorizedException()
    }

    return this.homeService.updateHomeById({ ...body, id })
  }

  @Roles(UserType.REALTOR, UserType.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async deleteHome(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: IUserFromToken
  ) {
    if (!user) {
      throw new UnauthorizedException()
    }

    const realtor = await this.homeService.getRealtorByHomeId(id)

    if (realtor.id !== user.id) {
      throw new UnauthorizedException()
    }

    return this.homeService.deleteHomeById(id)
  }

  @Roles(UserType.BUYER)
  @Post('/:id/inquire')
  inquire(
    @Param('id', ParseUUIDPipe) homeId: string,
    @User() user: IUserFromToken,
    @Body() body: InquireDTO
  ) {
    if (!user) {
      throw new UnauthorizedException()
    }

    return this.homeService.inquire({ user, ...body, homeId })
  }

  @Roles(UserType.REALTOR, UserType.ADMIN)
  @Get("/:id/messages")
  async getHomeMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: IUserFromToken,
  ) {
    if (!user) {
      throw new UnauthorizedException()
    }

    const realtor = await this.homeService.getRealtorByHomeId(id)

    if (realtor.id !== user.id) {
      throw new UnauthorizedException()
    }

    return this.homeService.getMessagesByHome(id)
  }
}
