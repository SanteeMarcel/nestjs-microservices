import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StocksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getStock(q: any, user: any) {
    const date = new Date();

    const { data } = await this.httpService.axiosRef.get(
      `http://${this.configService.get('MICROSERVICE_DOMAIN')}:3000/${q}`,
    );

    const result = {
      name: data.Name,
      symbol: data.Symbol,
      open: +data.Open,
      close: +data.Close,
      high: +data.High,
      low: +data.Low,
    };

    if (isNaN(result.open)) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.stockRequest.create({
      data: {
        ...result,
        user: { connect: { email: user.email } },
        date,
      },
    });

    return result;
  }

  async getHistory(user: any) {
    const queries = await this.prisma.stockRequest.findMany({
      where: { user },
      orderBy: { date: 'asc' },
    });
    return queries.map((query) => ({
      date: query.date,
      name: query.name,
      symbol: query.symbol,
      open: query.open,
      high: query.high,
      low: query.low,
      close: query.close,
    }));
  }

  async getStats() {
    const stats = await this.prisma.stockRequest.groupBy({
      by: ['symbol'],
      _count: {
        symbol: true,
      },
      orderBy: {
        _count: {
          symbol: 'desc',
        },
      },
      take: 5,
    });

    return stats.map((stat) => ({
      stock: stat.symbol?.toLowerCase(),
      times_requested: stat._count.symbol,
    }));
  }
}
