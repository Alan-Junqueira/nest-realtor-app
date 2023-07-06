import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query, UnauthorizedException } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDTO, HomeResponseDTO, UpdateHomeDTO } from 'src/dtos/home.dto';
import { PropertyType } from '@prisma/client';
import { IUserFromToken, User } from 'src/user/decorators/user.decorators';

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

  @Post()
  @HttpCode(201)
  createHome(
    @Body() body: CreateHomeDTO,
    @User() user: IUserFromToken
  ) {
    return this.homeService.createHome({ ...body, realtorId: user.id })
  }

  @Put(":id")
  async updateHome(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateHomeDTO,
    @User() user: IUserFromToken
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id)

    if (realtor.id !== user.id) {
      throw new UnauthorizedException()
    }

    return this.homeService.updateHomeById({ ...body, id })
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteHome(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: IUserFromToken
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id)

    if (realtor.id !== user.id) {
      throw new UnauthorizedException()
    }

    return this.homeService.deleteHomeById(id)
  }
}
