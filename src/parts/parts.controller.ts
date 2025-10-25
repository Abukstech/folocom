import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { QueryPartDto } from './dto/query-part.dto';
import { PartResponseDto } from './dto/part-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Parts')
@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new part',
    description: 'Sellers can create new auto parts with optional image upload',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'carMake', 'carModel', 'carYear', 'condition', 'price', 'stock', 'categoryId'],
      properties: {
        name: { type: 'string', example: 'Front Brake Pad Set' },
        carMake: { type: 'string', example: 'Toyota' },
        carModel: { type: 'string', example: 'Camry' },
        carYear: { type: 'number', example: 2015 },
        condition: { type: 'string', enum: ['BRAND_NEW', 'REFURBISHED', 'TOKUNBO'] },
        description: { type: 'string', example: 'High-quality ceramic brake pads' },
        price: { type: 'number', example: 25000.00 },
        stock: { type: 'number', example: 10 },
        categoryId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/parts',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `part-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiResponse({
    status: 201,
    description: 'Part created successfully',
    type: PartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only sellers can create parts' })
  async create(
    @CurrentUser() user: any,
    @Body() createPartDto: CreatePartDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/parts/${file.filename}` : undefined;
    return this.partsService.create(user.id, createPartDto, imageUrl);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all parts',
    description: 'Retrieve all parts with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Parts retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '507f1f77bcf86cd799439011',
            name: 'Front Brake Pad Set',
            carMake: 'Toyota',
            carModel: 'Camry',
            carYear: 2015,
            condition: 'BRAND_NEW',
            price: 25000.00,
            stock: 10,
          },
        ],
        meta: {
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      },
    },
  })
  async findAll(@Query() queryDto: QueryPartDto) {
    return this.partsService.findAll(queryDto);
  }

  @Get('my-parts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get seller\'s parts',
    description: 'Retrieve all parts created by the authenticated seller',
  })
  @ApiResponse({ status: 200, description: 'Seller parts retrieved successfully' })
  async findMy(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.partsService.findMy(user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get part by ID',
    description: 'Retrieve detailed information about a specific part',
  })
  @ApiResponse({
    status: 200,
    description: 'Part retrieved successfully',
    type: PartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Part not found' })
  async findOne(@Param('id') id: string) {
    return this.partsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update part',
    description: 'Sellers can update their own parts, admins can update any part',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        carMake: { type: 'string' },
        carModel: { type: 'string' },
        carYear: { type: 'number' },
        condition: { type: 'string', enum: ['BRAND_NEW', 'REFURBISHED', 'TOKUNBO'] },
        description: { type: 'string' },
        price: { type: 'number' },
        stock: { type: 'number' },
        categoryId: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/parts',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `part-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiResponse({ status: 200, description: 'Part updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Part not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updatePartDto: UpdatePartDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/parts/${file.filename}` : undefined;
    return this.partsService.update(id, user.id, user.role, updatePartDto, imageUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete part',
    description: 'Sellers can delete their own parts, admins can delete any part',
  })
  @ApiResponse({ status: 200, description: 'Part deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Part not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.partsService.remove(id, user.id, user.role);
  }
}