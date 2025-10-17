import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../utils';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string }) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  login(@Body() signInDto: { email: string; password: string }) {
    return this.authService.login(signInDto.email, signInDto.password);
  }

  @Get('activate')
  activate(@Query('token') token: string) {
    return this.authService.activate(token);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  checkToken(@Req() req) {
    return this.authService.getUser(req.user.userId);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    return this.authService.resetPassword(token, newPassword);
  }
}
