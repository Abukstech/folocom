import { IsString, IsInt, IsEnum, IsOptional, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PartCondition } from '@prisma/client';

export class CreateAssistedSourcingDto {
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
    description: 'Condition of the part required',
  })
  @IsEnum(PartCondition)
  condition: PartCondition;

  @ApiProperty({
    example: 'I need a front bumper for my Toyota Camry 2015',
    description: 'Detailed description of the required part',
  })
  @IsString()
  @MinLength(10)
  partDescription: string;
}