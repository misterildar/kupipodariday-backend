import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, user: User) {
    const wish = {
      ...createWishDto,
      owner: user,
    };
    return await this.wishesRepository.save(wish);
  }

  async findMany(query: FindManyOptions<Wish>) {
    return await this.wishesRepository.find(query);
  }

  async findOne(query: FindOneOptions<Wish>) {
    return await this.wishesRepository.findOne(query);
  }

  async getLastWishes() {
    return await this.findMany({ order: { createdAt: 'DESC' }, take: 40 });
  }

  async getTopWishes() {
    return await this.findMany({ order: { copied: 'DESC' }, take: 20 });
  }

  async getWishById(id: number) {
    const wish = await this.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!wish) throw new NotFoundException('Подарок не найден');
    return wish;
  }

  async updateById(userId: number, id: number, updateWishDto: UpdateWishDto) {
    const wish = await this.getWishById(id);
    if (wish.owner.id !== userId)
      throw new ForbiddenException(
        'Вы можете редактировать только свои подарки!',
      );
    return await this.wishesRepository.update(id, updateWishDto);
  }

  async removeOne(id: number, userId: number) {
    const wish = await this.getWishById(id);
    if (wish.owner.id !== userId)
      throw new ForbiddenException('Вы можете удалять только свои подарки!');
    return await this.wishesRepository.delete(id);
  }

  async wishCopy(wishId: number, user: User) {
    const wish = await this.findOne({
      where: { id: wishId },
      relations: { owner: true },
    });
    const { name, link, image, price, description } = wish;
    const isExistWish = await this.findOne({
      where: { name, link, image, price, owner: { id: user.id } },
      relations: { owner: true },
    });
    if (!!isExistWish) {
      throw new ForbiddenException('Вы уже копировали себе этот подарок');
    }
    await this.wishesRepository.update(wishId, { copied: +wish.copied + 1 });
    const wishCopy = {
      name,
      link,
      image,
      price,
      description,
      owner: user,
    };
    await this.create(wishCopy, user);

    return {};
  }
}
