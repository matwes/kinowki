import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UserService } from '../user/user.service';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async register(email: string, password: string, name?: string) {
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new ConflictException(`User with e-mail ${email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      email,
      password: hashedPassword,
      name,
      role: 'user',
      isActive: false,
    });

    const token = this.jwtService.sign(
      { sub: user._id, email: user.email },
      { expiresIn: '1d', secret: process.env.JWT_ACTIVATION_SECRET }
    );

    const activationLink = `${process.env.FRONTEND_URL}/activate?token=${token}`;
    await this.mailService.sendActivationEmail(user.email, activationLink);

    return { message: 'Activation email sent' };
  }

  async login(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(pass, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account not activated. Please check your email.');
    }

    const token = this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, resetPasswordToken, resetPasswordExpires, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async activate(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(token, {
        secret: process.env.JWT_ACTIVATION_SECRET,
      });
      const user = await this.userService.get(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const _id = user._id.toString();

      this.userService.update(_id, { _id, isActive: true });

      return { message: 'Account activated successfully' };
    } catch (err) {
      this.logger.error(`Error while activating user`, err);
      throw new BadRequestException('Invalid or expired activation link');
    }
  }

  async getUser(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, resetPasswordToken, resetPasswordExpires, ...user } = await this.userService.get(userId);
    return user;
  }

  async requestPasswordReset(email: string) {
    const user = await this.userService.findByEmail(email);
    if (user) {
      try {
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 15);
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await this.mailService.sendResetPassword(user.email, resetUrl);
      } catch (err) {
        this.logger.error(`Error while requesting resetting user password`, err);
        throw new BadRequestException('Error while requesting resetting user password');
      }
    }

    return { message: 'Jeśli istnieje konto z tym emailem, wysłano link resetujący' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userService.findByResetPasswordToken(token);

    if (!user) {
      throw new BadRequestException('Token is invalid or expired');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Hasło zostało zresetowane. Możesz się zalogować.' };
  }
}
