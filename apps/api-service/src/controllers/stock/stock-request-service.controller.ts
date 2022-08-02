import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StocksService } from '../../services/stocks/stocks.service';
import { JwtAuthGuard } from '../../models/auth/jwt-auth.guard';
import { StockHistory } from '../../models/stocks/stock-history';
import { StockQueryCounter } from '../../models/stocks/stock-query-counter';
import { StockResponse } from '../../models/stocks/stock-response';
import { Role } from '../../models/users/role.enum';

@Controller()
export class StockRequestController {
  constructor(private readonly stocksService: StocksService) {}

  @ApiBearerAuth()
  @Get('stock')
  @UseGuards(JwtAuthGuard)
  @ApiBadRequestResponse({ description: 'Missing query parameter' })
  @ApiNotFoundResponse({ description: 'Stock not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({
    type: StockResponse,
  })
  async getStock(@Query('q') query: string, @Request() req) {
    if (!query) {
      throw new HttpException(
        'Missing query parameter',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.stocksService.getStock(query, req.user);
  }

  @ApiBearerAuth()
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({
    type: StockHistory,
    isArray: true,
  })
  async getHistory(@Request() req) {
    return this.stocksService.getHistory(req.user);
  }

  @ApiBearerAuth()
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    type: StockQueryCounter,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Super-users only' })
  async getStats(@Request() req) {
    if (req.user.role !== Role.Admin) {
      throw new HttpException(
        'Unauthorized, super-users only',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.stocksService.getStats();
  }
}
