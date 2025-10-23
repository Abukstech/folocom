import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@ApiTags('parts')
@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new part' })
  @ApiBody({ type: CreatePartDto })
  @ApiResponse({ status: 201, description: 'Part created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createPartDto: CreatePartDto) {
    return this.partsService.create(createPartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all parts' })
  @ApiResponse({ status: 200, description: 'Return all parts' })
  findAll() {
    return this.partsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get part by ID' })
  @ApiParam({ name: 'id', description: 'Part ID' })
  @ApiResponse({ status: 200, description: 'Return the part' })
  @ApiResponse({ status: 404, description: 'Part not found' })
  findOne(@Param('id') id: string) {
    return this.partsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a part' })
  @ApiParam({ name: 'id', description: 'Part ID' })
  @ApiBody({ type: UpdatePartDto })
  @ApiResponse({ status: 200, description: 'Part updated successfully' })
  @ApiResponse({ status: 404, description: 'Part not found' })
  update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto) {
    return this.partsService.update(+id, updatePartDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a part' })
  @ApiParam({ name: 'id', description: 'Part ID' })
  @ApiResponse({ status: 200, description: 'Part deleted successfully' })
  @ApiResponse({ status: 404, description: 'Part not found' })
  remove(@Param('id') id: string) {
    return this.partsService.remove(+id);
  }
}
