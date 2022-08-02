import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { logError, logInfo } from '../../../utils/log.util';
import { csvToRecord } from '../../../utils/csv-to-record.util';

@Injectable()
export class GetStockHandler {
  constructor(private readonly httpService: HttpService) {}

  async handle(stockCode: string): Promise<Record<string, string>> {
    const trackingId = randomUUID();

    try {
      logInfo(
        trackingId,
        'getStock-handler',
        'Initialized message fetching handler',
      );

      const { data } = await firstValueFrom(
        this.httpService.get(
          `https://stooq.com/q/l/?s=${stockCode}&f=sd2t2ohlcvn&h&e=csv`,
        ),
      );
      const results = csvToRecord(data);

      return results[0];
    } catch (err) {
      logError(
        trackingId,
        'getStock-handler',
        `Error while fetching stock with the code ${stockCode}`,
        err,
      );

      throw err;
    }
  }
}
