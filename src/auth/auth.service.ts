import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async registration(createUserDto: CreateUserDto) {
    const newUser = await this.userService.createUser(createUserDto);
    return newUser;
  }

  login(user: User) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.getUserByName(username);
    const passwordIdMatch = await argon2.verify(user.password, password);
    if (user && passwordIdMatch) {
      return user;
    }
    throw new UnauthorizedException({
      message: 'Некорректные поля Юзернейм или Пароль',
    });
  }
}
