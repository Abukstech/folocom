import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartCondition } from '@prisma/client';

export class QueryPartDto {
  @ApiPropertyOptional({ description: 'Search by part name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by car make' })
  @IsOptional()
  @IsString()
  carMake?: string;

  @ApiPropertyOptional({ description: 'Filter by car model' })
  @IsOptional()
  @IsString()
  carModel?: string;

  @ApiPropertyOptional({ description: 'Filter by car year' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  carYear?: number;

  @ApiPropertyOptional({ enum: PartCondition, description: 'Filter by condition' })
  @IsOptional()
  @IsEnum(PartCondition)
  condition?: PartCondition;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}