import { Controller, Delete, Get, HttpCode, Post, Put } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDTO } from 'src/dtos/home.dto';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) { }

  @Get()
  getHomes(): Promise<HomeResponseDTO[]> {
    return this.homeService.getHomes()
  }

  @Get(":id")
  getHome() {
    return this.homeService.getHome()
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
