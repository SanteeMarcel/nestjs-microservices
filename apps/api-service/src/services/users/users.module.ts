import { Module } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaService],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
