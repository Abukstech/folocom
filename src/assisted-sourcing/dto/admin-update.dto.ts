import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsDateString,
    Min,
  } from 'class-validator';
  import { ApiPropertyOptional } from '@nestjs/swagger';
  import { Type } from 'class-transformer';
  import { SourcingStatus } from '@prisma/client';
  
  export class AdminUpdateSourcingDto {
    @ApiPropertyOptional({
      enum: SourcingStatus,
      example: SourcingStatus.QUOTED,
      description: 'Update the status of the sourcing request',
    })
    @IsEnum(SourcingStatus)
    @IsOptional()
    status?: SourcingStatus;
  
    @ApiPropertyOptional({
      example: 'Part is available from our supplier in Lagos',
      description: 'Admin notes about the sourcing request',
    })
    @IsString()
    @IsOptional()
    adminNotes?: string;
  
    @ApiPropertyOptional({
      example: 45000.0,
      description: 'Quoted price for the part in Naira',
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    quotedPrice?: number;
  
    @ApiPropertyOptional({
      example: '2025-11-10T00:00:00Z',
      description: 'Estimated delivery date',
    })
    @IsDateString()
    @IsOptional()
    estimatedDelivery?: string;
  }