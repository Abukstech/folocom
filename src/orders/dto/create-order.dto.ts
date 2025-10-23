import { ApiProperty } from '@nestjs/swagger';

class CreateOrderItemDto {
  @ApiProperty({ description: 'Part ID', example: 1 })
  partId: number;

  @ApiProperty({ description: 'Quantity of parts', example: 2 })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Total amount of the order', example: 199.99 })
  totalAmount: number;

  @ApiProperty({ 
    description: 'Order items', 
    type: [CreateOrderItemDto],
    example: [{ partId: 1, quantity: 2 }]
  })
  orderItems: CreateOrderItemDto[];
}