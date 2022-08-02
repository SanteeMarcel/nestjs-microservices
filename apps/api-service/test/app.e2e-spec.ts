import {
  INestApplication,
  INestMicroservice,
  ValidationPipe,
} from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { StockServiceModule } from '../../stock-service/src/stock-service.module';
import * as request from 'supertest';
import { ApiServiceModule } from '../src/api-service.module';
import { PrismaService } from '../src/infra/database/prisma.service';
import { useContainer } from 'class-validator';

async function createPublisherApp() {
  const fixture: TestingModule = await Test.createTestingModule({
    imports: [ApiServiceModule],
  }).compile();

  const app = fixture.createNestApplication();

  const prisma = app.get<PrismaService>(PrismaService);

  prisma.enableShutdownHooks(app);
  useContainer(app.select(ApiServiceModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.init();

  await app.startAllMicroservices();

  return [app, prisma];
}

async function createSubscriberApp() {
  const fixture: TestingModule = await Test.createTestingModule({
    imports: [StockServiceModule],
  }).compile();

  const app = fixture.createNestMicroservice({
    transport: Transport.TCP,
  });

  await app.listen();

  return app;
}

describe('Microservices (e2e)', () => {
  let publisherApp: INestApplication;
  let subscriberApp: INestMicroservice;
  let prisma: PrismaService;
  let httpServer: any;

  beforeEach(async () => {
    let value: any;
    [value, subscriberApp] = await Promise.all([
      createPublisherApp(),
      createSubscriberApp(),
    ]);
    [publisherApp, prisma] = value;
    httpServer = publisherApp.getHttpServer();
  });

  afterEach(async () => {
    await Promise.all([
      publisherApp.close(),
      subscriberApp.close(),
      prisma.$executeRawUnsafe(
        //sqlite does not support left join
        'DELETE FROM StockRequest WHERE UserId IN (SELECT UserId FROM User u INNER JOIN StockRequest sr ON (u.id = sr.userid) WHERE u.email = "john@doe.com");',
      ),
      prisma.$executeRawUnsafe('delete from User where email = "john@doe.com"'),
      prisma.$disconnect(),
    ]);
  });

  describe('/register (POST)', () => {
    it('should register a new user and return token', async () => {
      return request(httpServer)
        .post('/register')
        .send({
          email: 'john@doe.com',
          role: 'user',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
        });
    });
    it('should return 400 on registered user', async () => {
      await request(httpServer).post('/register').send({
        email: 'john@doe.com',
        role: 'user',
      });
      return request(httpServer)
        .post('/register')
        .send({
          email: 'john@doe.com',
          role: 'user',
        })
        .then((res) => {
          expect(res.status).toBe(400);
        });
    });
  });

  describe('/stock (GET)', () => {
    it('should return stock', async () => {
      const accessToken = (
        await request(httpServer).post('/register').send({
          email: 'john@doe.com',
          role: 'user',
        })
      ).body.access_token;

      request(httpServer)
        .get('/stock?q=AAPL.US')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res).toStrictEqual(
            expect.objectContaining({
              name: expect.any(String),
              symbol: expect.any(String),
              open: expect.any(Number),
              close: expect.any(Number),
              high: expect.any(Number),
              low: expect.any(Number),
            }),
          );
        });
      await new Promise((fulfill) => setTimeout(fulfill, 500));
    });
    it('should return 400 on missing query', async () => {
      const accessToken = await request(httpServer)
        .post('/register')
        .send({
          email: 'john@doe.com',
          role: 'user',
        })
        .then((res) => res.body.access_token);

      return request(httpServer)
        .get('/stock')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
    it('should not allow unauthenticated requests', async () => {
      return request(httpServer)
        .get('/stock')
        .set('Authorization', `Bearer ${'invalid'}`)
        .expect(401);
    });
  });

  describe('/history (GET)', () => {
    it('should return history data ascending', async () => {
      const accessToken = (
        await request(httpServer).post('/register').send({
          email: 'john@doe.com',
          role: 'user',
        })
      ).body.access_token;

      const date = new Date();

      await prisma.stockRequest.create({
        data: {
          symbol: 'AAPL.US',
          date,
          user: {
            connect: {
              email: 'john@doe.com',
            },
          },
        },
      });
      await prisma.stockRequest.create({
        data: {
          symbol: 'TSLA.US',
          date: new Date(date.getTime() + 1000),
          user: {
            connect: {
              email: 'john@doe.com',
            },
          },
        },
      });

      return request(httpServer)
        .get('/history')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(typeof res.body).toBe('object');
          expect(res.body).toHaveLength(2);
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('symbol');
          expect(res.body[0]).toHaveProperty('date');
          expect(res.body[0]).toHaveProperty('open');
          expect(res.body[0]).toHaveProperty('close');
          expect(res.body[0]).toHaveProperty('high');
          expect(res.body[0]).toHaveProperty('low');
          expect(res.body[0].date).toBe(date.toISOString());
        });
    });
    it('should not allow unauthenticated requests', async () => {
      return request(httpServer)
        .get('/history')
        .set('Authorization', `Bearer ${'invalid'}`)
        .expect(401);
    });
  });

  describe('/stats (GET)', () => {
    it('should return stats data', async () => {
      const accessToken = (
        await request(httpServer).post('/register').send({
          email: 'john@doe.com',
          role: 'admin',
        })
      ).body.access_token;

      Array.from({ length: 3 }, async () => {
        await prisma.stockRequest.create({
          data: {
            symbol: 'AAPL.US',
            user: {
              connect: {
                email: 'john@doe.com',
              },
            },
          },
        });
        await prisma.stockRequest.create({
          data: {
            symbol: 'TSLA.US',
            user: {
              connect: {
                email: 'john@doe.com',
              },
            },
          },
        });
      });

      return request(httpServer)
        .get('/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(typeof res.body).toBe('object');
          expect(res.body).toHaveLength(5);
          expect(res.body[0]).toHaveProperty('stock');
          expect(res.body[0]).toHaveProperty('times_requested');
        });
    });

    it('should refuse non-super users', async () => {
      const accessToken = (
        await request(httpServer).post('/register').send({
          email: 'john@doe.com',
          role: 'user',
        })
      ).body.access_token;
      return request(httpServer)
        .get('/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });
});
