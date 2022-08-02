import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUser } from '../../models/users/register-user';
import { Role } from '../../models/users/role.enum';
import { EmailExternalProvider } from '../../infra/email/email.external.provider';
import { PrismaService } from '../../infra/database/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          useFactory: async () => ({
            secret: 'SECRET_KEY',
          }),
        }),
        ConfigModule.forRoot({}),
      ],
      providers: [
        AuthService,
        UsersService,
        PrismaService,
        ConfigModule,
        EmailExternalProvider,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    const usersService = module.get<UsersService>(UsersService);
    usersService.create = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should return a token', () => {
      const user: RegisterUser = {
        email: 'john@doe.com',
        role: Role.User,
      };
      const result = service.signUp(user);
      expect(result).resolves.toEqual({
        email: 'john@doe.com',
        access_token: expect.any(String),
      });
    });
  });
});
