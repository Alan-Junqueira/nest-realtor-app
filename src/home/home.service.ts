import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { HomeResponseDTO } from 'src/dtos/home.dto';
import { PrismaService } from 'src/prisma/prisma.service';

interface IGetHomesParams {
  city?: string
  price?: {
    gte?: number
    lte?: number
  },
  property_type: PropertyType
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) { }

  async getHomes(filters: IGetHomesParams): Promise<HomeResponseDTO[]> {
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
      },
      where: filters
    })

    if (!homes.length) {
      throw new NotFoundException()
    }

    return homes.map(home => {
      const fetchHome = { ...home, image: home.Images[0].url }
      delete fetchHome.Images

      return new HomeResponseDTO(fetchHome)
    })
  }

  async getHome(id: string): Promise<HomeResponseDTO> {
    const home = await this.prismaService.home.findUnique({
      where: {
        id
      }
    })

    if (!home) {
      throw new NotFoundException()
    }

    return new HomeResponseDTO(home)
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
