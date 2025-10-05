import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { UserDocument } from '../user/user.schema';
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
    const user = (await this.userService.create({
      email,
      password: hashedPassword,
      name,
      role: 'user',
      isActive: false,
    })) as UserDocument;

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

    const token = this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

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
}
