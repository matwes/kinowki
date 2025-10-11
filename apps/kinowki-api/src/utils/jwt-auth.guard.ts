import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err) {
      throw new UnauthorizedException('Token invalid or expired');
    }

    if (!user) {
      throw new UnauthorizedException('Not logged in');
    }

    return user;
  }
}
