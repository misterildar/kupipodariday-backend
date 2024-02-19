import { IsInt, IsBoolean } from 'class-validator';

export class CreateOfferDto {
  @IsInt()
  amount: number;

  @IsBoolean()
  hidden: boolean;

  @IsInt()
  user: number;

  @IsInt()
  item: number;
}
