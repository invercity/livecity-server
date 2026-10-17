import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('service')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginOrLogout(
    @Query('act') act: 'login' | 'logout',
    @Body() body: { login?: string; pass?: string },
  ) {
    if (act === 'logout') {
      return { logout: true };
    }
    try {
      return await this.authService.validateUser(
        body.login ?? '',
        body.pass ?? '',
      );
    } catch {
      return { error: 'Invalid user data' };
    }
  }

  @Post('register')
  register(@Body() body: { username: string; password: string }) {
    return this.authService.register(body.username, body.password);
  }

  @Get('app')
  getAppInfo() {
    return { version: '1.0.0-next' };
  }
}
