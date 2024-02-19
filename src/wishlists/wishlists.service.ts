import { Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
  ) {}

  create(createWishlistDto: CreateWishlistDto, ownerId: number) {
    //TODO
    // console.log(createWishlistDto);

    const { itemsId, ...rest } = createWishlistDto;
    const items = itemsId.map((id) => ({ id }));
    const wishList = {
      ...rest,
      items,
      owner: { id: ownerId },
    };
    return this.wishlistsRepository.save(wishList);
  }

  updateOne(id: number, updateWishlistDto: UpdateWishlistDto) {
    return `This action updates a #${id} wishlist`;
  }

  removeOne(id: number) {
    return `This action removes a #${id} wishlist`;
  }

  async getWishLists() {
    return this.findMany({
      relations: ['items', 'owner'],
    });
  }

  findOne(query: FindOneOptions<Wishlist>) {
    return this.wishlistsRepository.findOne(query);
  }

  findMany(query: FindManyOptions<Wishlist>) {
    return this.wishlistsRepository.find(query);
  }
}
