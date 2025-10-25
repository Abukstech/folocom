import { ApiProperty } from '@nestjs/swagger';
import { PartCondition } from '@prisma/client';

export class PartResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  carMake: string;

  @ApiProperty()
  carModel: string;

  @ApiProperty()
  carYear: number;

  @ApiProperty({ enum: PartCondition })
  condition: PartCondition;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  price: number;

  @ApiProperty()
  stock: number;

  @ApiProperty({ nullable: true })
  imageUrl: string | null;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  sellerId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}