import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SourcingStatus } from '@prisma/client';

export class QueryAssistedSourcingDto {
  @ApiPropertyOptional({
    enum: SourcingStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(SourcingStatus)
  status?: SourcingStatus;

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