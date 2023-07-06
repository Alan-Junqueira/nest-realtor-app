import { Injectable } from '@nestjs/common';
import { HomeResponseDTO } from 'src/dtos/home.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) { }

  async getHomes(): Promise<HomeResponseDTO[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        property_type: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        Images: {
          select: {
            url: true
          },
          take: 1
        }
      }
    })

    return homes.map(home => {
      const fetchHome = { ...home, image: home.Images[0].url }
      delete fetchHome.Images
      
      return new HomeResponseDTO(fetchHome)
    })
  }

  async getHome() {
    return
  }

  async createHome() {
    return
  }

  async editHome() {
    return
  }

  async deleteHome() {
    return
  }

}
