import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { StockServiceController } from './controllers/stock-service.controller';
import { GetStockHandler } from './services/stocks/get-stock/get-stock.handler';

@Module({
  imports: [HttpModule],
  controllers: [StockServiceController],
  providers: [GetStockHandler],
})
export class StockServiceModule {}
