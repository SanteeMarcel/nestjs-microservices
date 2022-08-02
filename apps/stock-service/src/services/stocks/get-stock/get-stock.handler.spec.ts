import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { GetStockHandler } from './get-stock.handler';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

const stooqResponse =
  'Symbol,Date,Time,Open,High,Low,Close,Volume,Name\n' +
  'AAPL.US,2022-07-29,22:00:11,161.24,163.63,159.5,162.51,101786860,APPLE\n';

const axiosResponse: AxiosResponse = {
  data: stooqResponse,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  request: {},
};

const output = {
  Symbol: 'AAPL.US',
  Date: '2022-07-29',
  Time: '22:00:11',
  Open: '161.24',
  High: '163.63',
  Low: '159.5',
  Close: '162.51',
  Volume: '101786860',
  Name: 'APPLE',
};

describe('StocksService', () => {
  let getStock: GetStockHandler;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [GetStockHandler],
    }).compile();

    getStock = module.get<GetStockHandler>(GetStockHandler);
    httpService = module.get<HttpService>(HttpService);
    jest.spyOn(console, 'log').mockImplementation();
  });

  it('should be defined', () => {
    expect(getStock).toBeDefined();
  });

  it('should return stock data', async () => {
    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => of(axiosResponse));
    const result = await getStock.handle('AAPL.US');
    expect(result).toEqual(output);
  });

  it('should catch errors', async () => {
    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => of({} as AxiosResponse));
    try {
      await getStock.handle('AAPL.US');
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});
