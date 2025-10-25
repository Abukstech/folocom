import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  Min, 
  IsEnum,
  IsInt,
  MinLength 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PartCondition } from '@prisma/client';

export class CreatePartDto {
  @ApiProperty({
    example: 'Front Brake Pad Set',
    description: 'Name of the auto part',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Toyota',
    description: 'Car manufacturer/make',
  })
  @IsString()
  carMake: string;

  @ApiProperty({
    example: 'Camry',
    description: 'Car model',
  })
  @IsString()
  carModel: string;

  @ApiProperty({
    example: 2015,
    description: 'Car manufacturing year',
  })
  @IsInt()
  @Min(1900)
  @Type(() => Number)
  carYear: number;

  @ApiProperty({
    enum: PartCondition,
    example: PartCondition.BRAND_NEW,
    description: 'Condition of the part',
  })
  @IsEnum(PartCondition)
  condition: PartCondition;

  @ApiPropertyOptional({
    example: 'High-quality ceramic brake pads with excellent stopping power',
    description: 'Detailed description of the part',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 25000.00,
    description: 'Price of the part in Naira',
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: 10,
    description: 'Available stock quantity',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Category ID',
  })
  @IsString()
  categoryId: string;
}
