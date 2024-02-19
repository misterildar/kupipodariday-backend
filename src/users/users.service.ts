import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  HttpStatus,
  Injectable,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  getMe(user: User) {
    this.deletePassword(user);
    return user;
  }

  async updateMe(id: number, updateUserDto: UpdateUserDto) {
    const { username, email, password } = updateUserDto;
    if (username) {
      const existUserName = await this.findOne({
        where: { username },
      });
      if (existUserName) {
        throw new BadRequestException(
          'Такое имя уже существует, выберите пожалуйста другое',
        );
      }
    }
    if (email) {
      const existUserEmail = await this.findOne({
        where: { email },
      });
      if (existUserEmail) {
        throw new BadRequestException(
          'Такой email уже существует, выберите пожалуйста другой',
        );
      }
    }
    if (password) {
      updateUserDto.password = await argon2.hash(password);
    }
    await this.userRepository.update(id, updateUserDto);
    const { ...updateUserData } = await this.findOne({ where: { id } });
    this.deletePassword(updateUserData);
    return updateUserData;
  }

  async getMeWishes(id: number) {
    const user = await this.findOne({
      where: { id },
      relations: {
        wishes: { owner: true },
      },
    });
    this.deletePassword(user);
    return user.wishes;
  }

  async getUserByName(username: string) {
    return await this.findOne({ where: { username } });
  }

  async getUserNameWishes(username: string) {
    const user = await this.findOne({
      where: { username },
      relations: { wishes: true },
    });
    this.deletePassword(user);
    return user.wishes;
  }

  async findUserByNameOrEmail(emailOrName: string) {
    const [...user] = await this.findMany({
      where: [{ username: emailOrName }, { email: emailOrName }],
    });
    this.deletePassword(user[0]);
    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;
    const existEmail = await this.findOne({ where: { email } });
    if (existEmail) {
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existUserName = await this.findOne({ where: { username } });
    if (existUserName) {
      throw new HttpException(
        'Пользователь с таким именем уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hachPassword = await argon2.hash(password);
    const user = await this.userRepository.save({
      ...createUserDto,
      password: hachPassword,
    });
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const { email, id, username } = user;
    const payload = { email, id, username };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  findOne(query: FindOneOptions<User>) {
    return this.userRepository.findOne(query);
  }

  findMany(query: FindManyOptions<User>) {
    return this.userRepository.find(query);
  }

  deletePassword(user: User) {
    delete user.password;
    return user;
  }
}
