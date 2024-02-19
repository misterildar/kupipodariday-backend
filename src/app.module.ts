import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Wish } from './wishes/entities/wish.entity';
import { User } from './users/entities/user.entity';
import { WishesModule } from './wishes/wishes.module';
import { OffersModule } from './offers/offers.module';
import { Offer } from './offers/entities/offer.entity';
import { WishlistsModule } from './wishlists/wishlists.module';
import { Wishlist } from './wishlists/entities/wishlist.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.js, .ts}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    WishesModule,
    OffersModule,
    WishlistsModule,
  ],
})
export class AppModule {}
