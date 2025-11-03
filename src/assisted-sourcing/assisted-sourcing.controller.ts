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
  import { AssistedSourcingService } from './assisted-sourcing.service';

  import { UpdateAssistedSourcingDto } from './dto/update-assisted-sourcing.dto';

  import { QueryAssistedSourcingDto } from './dto/query-assisted-sourcing.dto';
  import { AssistedSourcingResponseDto } from './dto/assisted-sourcing-response.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { CurrentUser } from '../auth/decorators/current-user.decorator';
  import { Role } from '@prisma/client';
import { CreateAssistedSourcingDto } from './dto/create-assisted.dto';
import { AdminUpdateSourcingDto } from './dto/admin-update.dto';
  
  @ApiTags('Assisted Sourcing')
  @Controller('assisted-sourcing')
  export class AssistedSourcingController {
    constructor(
      private readonly assistedSourcingService: AssistedSourcingService,
    ) {}
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.BUYER, Role.MECHANIC)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: 'Create assisted sourcing request',
      description:
        'Buyers and mechanics can request help finding specific auto parts',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        required: ['carMake', 'carModel', 'carYear', 'condition', 'partDescription'],
        properties: {
          carMake: { type: 'string', example: 'Toyota' },
          carModel: { type: 'string', example: 'Camry' },
          carYear: { type: 'number', example: 2015 },
          condition: {
            type: 'string',
            enum: ['BRAND_NEW', 'REFURBISHED', 'TOKUNBO'],
            example: 'BRAND_NEW',
          },
          partDescription: {
            type: 'string',
            example: 'I need a front bumper for my Toyota Camry 2015',
          },
          image: {
            type: 'string',
            format: 'binary',
            description: 'Optional image of required part (max 5MB)',
          },
        },
      },
    })
    @UseInterceptors(FileInterceptor('image'))
    @ApiResponse({
      status: 201,
      description: 'Sourcing request created successfully',
      type: AssistedSourcingResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
      status: 403,
      description: 'Forbidden - Only buyers and mechanics can create requests',
    })
    async create(
      @CurrentUser() user: any,
      @Body() createDto: CreateAssistedSourcingDto,
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

      const transformedDto = {
        ...createDto,
        carYear: Number(createDto.carYear),
      };
      return this.assistedSourcingService.create(user.id, transformedDto ,file);
    }
  
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: 'Get all sourcing requests (Admin only)',
      description: 'Retrieve all assisted sourcing requests with optional filtering',
    })
    @ApiResponse({
      status: 200,
      description: 'Requests retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    async findAll(
      @Query() queryDto: QueryAssistedSourcingDto,
      @CurrentUser() user: any,
    ) {
      return this.assistedSourcingService.findAll(queryDto, user.role);
    }
  
    @Get('my-requests')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.BUYER, Role.MECHANIC)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: 'Get my sourcing requests',
      description: 'Retrieve all sourcing requests created by the authenticated user',
    })
    @ApiResponse({
      status: 200,
      description: 'Requests retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findMy(
      @CurrentUser() user: any,
      @Query('page') page?: number,
      @Query('limit') limit?: number,
    ) {
      return this.assistedSourcingService.findMyRequests(user.id, page, limit);
    }
  
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: 'Get sourcing request by ID',
      description: 'Retrieve detailed information about a specific sourcing request',
    })
    @ApiResponse({
      status: 200,
      description: 'Request retrieved successfully',
      type: AssistedSourcingResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    async findOne(@Param('id') id: string, @CurrentUser() user: any) {
      return this.assistedSourcingService.findOne(id, user.id, user.role);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.BUYER, Role.MECHANIC)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: 'Update sourcing request',
      description:
        'Users can update their own requests if status is PENDING or CANCELLED',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          carMake: { type: 'string' },
          carModel: { type: 'string' },
          carYear: { type: 'number' },
          condition: { type: 'string', enum: ['BRAND_NEW', 'REFURBISHED', 'TOKUNBO'] },
          partDescription: { type: 'string' },
          image: { type: 'string', format: 'binary' },
        },
      },
    })
    @UseInterceptors(FileInterceptor('image'))
    @ApiResponse({ status: 200, description: 'Request updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    async update(
      @Param('id') id: string,
      @CurrentUser() user: any,
      @Body() updateDto: UpdateAssistedSourcingDto,
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
      return this.assistedSourcingService.update(
        id,
        user.id,
        user.role,
        updateDto,
        file,
      );
    }
  
    @Patch(':id/admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: 'Admin update sourcing request',
      description:
        'Admin can update status, add notes, provide quote, and set delivery date',
    })
    @ApiBody({ type: AdminUpdateSourcingDto })
    @ApiResponse({ status: 200, description: 'Request updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    async adminUpdate(
      @Param('id') id: string,
      @Body() adminUpdateDto: AdminUpdateSourcingDto,
    ) {
      return this.assistedSourcingService.adminUpdate(id, adminUpdateDto);
    }
  
    @Post(':id/accept-quote')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.BUYER, Role.MECHANIC)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: 'Accept admin quote',
      description: 'User accepts the quote provided by admin',
    })
    @ApiResponse({ status: 200, description: 'Quote accepted successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    async acceptQuote(@Param('id') id: string, @CurrentUser() user: any) {
      return this.assistedSourcingService.acceptQuote(id, user.id);
    }
  
    @Post(':id/cancel')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: 'Cancel sourcing request',
      description: 'User or admin can cancel a sourcing request',
    })
    @ApiResponse({ status: 200, description: 'Request cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    async cancel(@Param('id') id: string, @CurrentUser() user: any) {
      return this.assistedSourcingService.cancel(id, user.id, user.role);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: 'Delete sourcing request',
      description: 'User or admin can delete a sourcing request',
    })
    @ApiResponse({ status: 200, description: 'Request deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    async remove(@Param('id') id: string, @CurrentUser() user: any) {
      return this.assistedSourcingService.remove(id, user.id, user.role);
    }
  }
