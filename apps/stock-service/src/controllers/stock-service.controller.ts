import { Controller, Get, Param } from '@nestjs/common';
import { GetStockHandler } from '../services/stocks/get-stock/get-stock.handler';

@Controller()
export class StockServiceController {
  constructor(private readonly getStockHandler: GetStockHandler) {}

  @Get('/:stock_code')
  async getStockInfo(
    @Param('stock_code') stockCode: string,
  ): Promise<Record<string, string>> {
    return this.getStockHandler.handle(stockCode);
  }
}
