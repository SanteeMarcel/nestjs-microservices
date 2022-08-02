import { Module } from '@nestjs/common';
import { AuthModule } from './services/auth/auth.module';
import { UsersModule } from './services/users/users.module';
import { StocksModule } from './services/stocks/stocks.module';
import { StocksService } from './services/stocks/stocks.service';
import { PrismaService } from './infra/database/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './controllers/auth/auth-service.controller';
import { StockRequestController } from './controllers/stock/stock-request-service.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    StocksModule,
    HttpModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AuthController, StockRequestController],
  providers: [StocksService, PrismaService],
})
export class ApiServiceModule {}
