import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infra/database/prisma.service';
import { StocksService } from './stocks.service';

const microServiceRequest = Promise.resolve({
  data: {
    Name: 'Apple',
    Symbol: 'AAPL',
    Open: '123.45',
    Close: '123.45',
    High: '123.45',
    Low: '123.45',
  },
});

describe('StocksService', () => {
  let service: StocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [StocksService, PrismaService],
    }).compile();

    service = module.get<StocksService>(StocksService);
    const httpService = module.get<HttpService>(HttpService);
    jest.spyOn(httpService.axiosRef, 'get').mockImplementation(() => {
      return microServiceRequest;
    });
    const prismaService = module.get<PrismaService>(PrismaService);
    prismaService.user.findFirst = jest.fn().mockReturnValueOnce({ id: 1 });
    prismaService.stockRequest.create = jest.fn();
    prismaService.stockRequest.findMany = jest.fn().mockReturnValueOnce([
      {
        id: 1,
        name: 'Apple',
        symbol: 'AAPL',
        open: 123.45,
        close: 123.45,
        high: 123.45,
        low: 123.45,
        date: new Date(),
      },
    ]);
    prismaService.stockRequest.groupBy = jest
      .fn()
      .mockReturnValueOnce([{ _count: { symbol: 1 }, symbol: 'AAPL.US' }]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return stock data', async () => {
    const result = await service.getStock('aapl.us', { email: 'john@doe.com' });
    expect(result).toEqual({
      name: 'Apple',
      symbol: 'AAPL',
      open: 123.45,
      close: 123.45,
      high: 123.45,
      low: 123.45,
    });
  });

  it('should return stock history', async () => {
    const result = await service.getHistory({ email: 'john@doe.com' });
    expect(result).toEqual([
      {
        date: expect.any(Date),
        name: 'Apple',
        symbol: 'AAPL',
        open: 123.45,
        high: 123.45,
        low: 123.45,
        close: 123.45,
      },
    ]);
  });

  it('should return stock stats', async () => {
    const result = await service.getStats();
    expect(result).toEqual([
      {
        stock: 'aapl.us',
        times_requested: 1,
      },
    ]);
  });
});
