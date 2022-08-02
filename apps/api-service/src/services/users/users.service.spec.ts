import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../../infra/database/prisma.service';
import { UsersService } from './users.service';

const user: User = {
  id: 1,
  email: 'john@doe.com',
  accessToken: '123456',
  role: 'user',
};

const db = {
  user: {
    findFirst: jest.fn().mockImplementation((arg) => {
      if (arg.where.email === user.email) {
        return user;
      }
      return null;
    }),
    create: jest.fn().mockImplementation((arg) => arg),
    update: jest.fn().mockImplementation((arg) => arg.data.accessToken),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create user', async () => {
      const user = await service.create({ email: 'mary@doe.com' });
      expect(user).toEqual(user);
    });
    it('should throw error on existing user', async () => {
      await expect(service.create({ email: 'john@doe.com' })).rejects.toThrow(
        'User already exists',
      );
    });
  });

  describe('findOneByEmail', () => {
    it('should get a user', async () => {
      const user = await service.findOneByEmail('john@doe.com');
      expect(user).toEqual(user);
    });
    it('should throw error on non-existing user', async () => {
      await expect(service.findOneByEmail('mary@doe.com')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('updateToken', () => {
    it('should update token', async () => {
      const token = await service.updateToken(1, '12345');
      expect(token).toEqual('12345');
    });
  });
});
