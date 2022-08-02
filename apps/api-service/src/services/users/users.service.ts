import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(user): Promise<User> {
    const lookUp = await this.prisma.user.findFirst({
      where: {
        email: user.email,
      },
    });
    if (lookUp?.email) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    return this.prisma.user.create({
      data: user,
    });
  }
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
  async updateToken(id: number, token: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { accessToken: token },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
