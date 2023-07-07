import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { HomeResponseDTO } from 'src/dtos/home.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUserFromToken } from 'src/user/decorators/user.decorator';

interface IGetHomesParams {
  city?: string
  price?: {
    gte?: number
    lte?: number
  },
  property_type: PropertyType
}

interface ICreateHomeParams {
  address: string
  numberOfBedrooms: number
  numberOfBathrooms: number
  city: string
  price: number
  landSize: number
  propertyType: PropertyType
  realtorId: string
  images: { url: string }[]
}

interface IUpdateHomeParams {
  id: string
  address?: string
  numberOfBedrooms?: number
  numberOfBathrooms?: number
  city?: string
  price?: number
  landSize?: number
  propertyType?: PropertyType
  realtorId?: string
}

interface IInquireParams {
  user: IUserFromToken,
  homeId: string
  message: string
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

  async createHome({
    address,
    city,
    images,
    landSize,
    numberOfBathrooms,
    numberOfBedrooms,
    price,
    propertyType,
    realtorId
  }: ICreateHomeParams) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        city,
        land_size: landSize,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        price,
        property_type: propertyType,
        realtor_id: realtorId
      }
    })

    const homeImages = images.map(image => ({ ...image, home_id: home.id }))

    await this.prismaService.image.createMany({
      data: homeImages
    })

    return new HomeResponseDTO(home)
  }

  async updateHomeById({
    id,
    address,
    city,
    landSize,
    numberOfBathrooms,
    numberOfBedrooms,
    price,
    propertyType,
    realtorId
  }: IUpdateHomeParams) {
    const existingHome = await this.prismaService.home.findUnique({
      where: {
        id
      }
    })

    if (!existingHome) {
      throw new NotFoundException()
    }

    const updatedHome = await this.prismaService.home.update({
      where: {
        id
      },
      data: {
        address,
        city,
        land_size: landSize,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        price,
        property_type: propertyType,
        realtor_id: realtorId
      }
    })

    return new HomeResponseDTO(updatedHome)
  }

  async deleteHomeById(id: string) {
    await this.prismaService.home.delete({
      where: {
        id
      }
    })

    return
  }

  async getRealtorByHomeId(id: string) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id
      },
      select: {
        realtor: {
          select: {
            name: true,
            id: true,
            email: true,
            phone_number: true
          }
        }
      }
    })

    if (!home) {
      throw new NotFoundException()
    }

    return home.realtor
  }

  async inquire({
    homeId,
    message,
    user
  }: IInquireParams) {
    const realtor = await this.getRealtorByHomeId(homeId)

    const newMessage = await this.prismaService.message.create({
      data: {
        realtor_id: realtor.id,
        buyer_id: user.id,
        home_id: homeId,
        message
      }
    })

    return { newMessage }
  }

  async getMessagesByHome(homeId: string) {
    const messages = await this.prismaService.message.findMany({
      where: {
        home_id: homeId
      },
      select: {
        message: true,
        buyer: {
          select: {
            name: true,
            phone_number: true,
            email: true
          }
        }
      }
    })

    return { messages }
  }
}
