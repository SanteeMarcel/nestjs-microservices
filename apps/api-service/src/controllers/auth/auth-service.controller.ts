import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ClientResponse } from '@sendgrid/mail';
import { AuthService } from '../../services/auth/auth.service';
import { Email } from '../../models/auth/email';
import { RegisterUser } from '../../models/users/register-user';
import { RegisterUserResponse } from '../../models/users/register-user-response';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: RegisterUserResponse,
  })
  @ApiBadRequestResponse({ description: 'User already exists' })
  async signUp(@Body() data: RegisterUser): Promise<RegisterUserResponse> {
    return this.authService.signUp(data);
  }

  @Post('reset-password')
  @ApiOkResponse({ description: 'Password reset email sent' })
  @ApiUnauthorizedResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Invalid query' })
  async resetPassword(@Body() email: Email): Promise<[ClientResponse, any]> {
    if (!email) {
      throw new HttpException(
        'Missing query parameter',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.authService.resetPassword(email);
  }
}
