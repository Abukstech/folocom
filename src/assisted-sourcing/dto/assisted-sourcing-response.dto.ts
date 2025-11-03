import { ApiProperty } from '@nestjs/swagger';
import { PartCondition, SourcingStatus } from '@prisma/client';

export class AssistedSourcingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  carMake: string;

  @ApiProperty()
  carModel: string;

  @ApiProperty()
  carYear: number;

  @ApiProperty({ enum: PartCondition })
  condition: PartCondition;

  @ApiProperty()
  partDescription: string;

  @ApiProperty({ nullable: true })
  imageUrl: string | null;

  @ApiProperty({ enum: SourcingStatus })
  status: SourcingStatus;

  @ApiProperty({ nullable: true })
  adminNotes: string | null;

  @ApiProperty({ nullable: true })
  quotedPrice: number | null;

  @ApiProperty({ nullable: true })
  estimatedDelivery: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}