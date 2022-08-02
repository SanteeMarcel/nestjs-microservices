import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../infra/database/prisma.service';
import { StocksService } from './stocks.service';

@Module({
  imports: [PrismaService, HttpModule, ConfigModule.forRoot()],
  providers: [StocksService, PrismaService],
})
export class StocksModule {}
