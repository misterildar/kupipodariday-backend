import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsUrl, Length, IsDate, IsInt, IsString } from 'class-validator';

import { User } from 'src/users/entities/user.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @Column()
  @Length(1, 250)
  name: string;

  @Column()
  @IsUrl()
  link: string;

  @Column()
  @IsUrl()
  image: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  @IsInt()
  price: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  @IsInt()
  raised: number;

  @Column()
  @IsString()
  @Length(1, 1024)
  description: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 0,
    default: 0,
  })
  @IsInt()
  copied: number;

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];

  @ManyToMany(() => Wishlist, (wishlist) => wishlist.items)
  wishlists: Wishlist[];
}
