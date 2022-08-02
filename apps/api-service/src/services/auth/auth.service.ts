import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUser } from '../../models/users/register-user';
import { RegisterUserResponse } from '../../models/users/register-user-response';
import { EmailExternalProvider } from '../../infra/email/email.external.provider';
import { Email } from '../../models/auth/email';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: EmailExternalProvider,
  ) {}

  async signUp(data: RegisterUser) {
    const accessToken = this.jwtService.sign(data);
    await this.usersService.create({ ...data, accessToken });
    return {
      email: data.email,
      access_token: accessToken,
    } as RegisterUserResponse;
  }

  async resetPassword(email: Email) {
    const user = await this.usersService.findOneByEmail(email.email);
    const newJwtToken = this.jwtService.sign({
      email: user.email,
      role: user.role,
    });
    await this.usersService.updateToken(user.id, newJwtToken);
    return this.mailService.sendPasswordResetEmail(email.email, newJwtToken);
  }
}
