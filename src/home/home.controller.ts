import { Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDTO } from 'src/dtos/home.dto';
import { PropertyType } from '@prisma/client';

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
    @Param('id') id: string
  ) {
    return this.homeService.getHome(id)
  }

  @Post()
  @HttpCode(201)
  createHome() {
    return this.homeService.createHome()
  }

  @Put(":id")
  editHome() {
    return this.homeService.editHome()
  }

  @Delete()
  @HttpCode(204)
  deleteHome() {
    return this.homeService.deleteHome()
  }
}
