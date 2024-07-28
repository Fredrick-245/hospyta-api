import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, LogInUserDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(body: CreateUserDto) {
    // Create password hash
    const hashedPassword = await argon.hash(body.hash);
    const user = { ...body, hash: hashedPassword };
    // Add user to db
    try {
      const createdUser = await this.prisma.user.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          hash: user.hash,
        },
      });
      // delete hash
      delete createdUser.hash;
      // return user
      return this.asignToken(createdUser.email, createdUser.id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code == 'P2002') {
          throw new ForbiddenException('User already exists');
        }
      }
      throw err;
    }
  }

  async login(body: LogInUserDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('User does not exist,Please sign up first');
    }
    if (await argon.verify(user.hash, body.hash)) {
      delete user.hash;
      return this.asignToken(user.email, user.id);
    } else {
      throw new ForbiddenException('Enter correct password');
    }

    // Decrypt password

    // Compare password
    // Return user
  }

  async asignToken(userEmail: string, userId: number) {
    const payload = {
      sub: userId,
      userEmail,
    };
    return {
      access_token: await this.jwt.signAsync(payload, {
        expiresIn: '145m',
        secret: this.config.get('JWT_SECRET'),
      }),
    };
  }
}
