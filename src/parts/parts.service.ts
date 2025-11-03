import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { QueryPartDto } from './dto/query-part.dto';
import { Role } from '@prisma/client';

@Injectable()
export class PartsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    sellerId: string,
    createPartDto: CreatePartDto,
    file?: Express.Multer.File,
  ) {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createPartDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    let imageUrl: string | null = null;

    // Upload image to Cloudinary if provided
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(
          file,
          'auto-parts/parts',
        );
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestException('Failed to upload image');
      }
    }

    return this.prisma.part.create({
      data: {
        ...createPartDto,
        sellerId,
        imageUrl,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(queryDto: QueryPartDto) {
    const {
      search,
      carMake,
      carModel,
      carYear,
      condition,
      categoryId,
      page = 1,
      limit = 10,
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (carMake) where.carMake = { contains: carMake, mode: 'insensitive' };
    if (carModel) where.carModel = { contains: carModel, mode: 'insensitive' };
    if (carYear) where.carYear = carYear;
    if (condition) where.condition = condition;
    if (categoryId) where.categoryId = categoryId;

    const [parts, total] = await Promise.all([
      this.prisma.part.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.part.count({ where }),
    ]);

    return {
      data: parts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const part = await this.prisma.part.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    return part;
  }

  async findMy(sellerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [parts, total] = await Promise.all([
      this.prisma.part.findMany({
        where: { sellerId },
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.part.count({ where: { sellerId } }),
    ]);

    return {
      data: parts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    id: string,
    userId: string,
    userRole: Role,
    updatePartDto: UpdatePartDto,
    file?: Express.Multer.File,
  ) {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    // Only seller who created the part or admin can update
    if (part.sellerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to update this part');
    }

    // Verify category if being updated
    if (updatePartDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updatePartDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    let imageUrl: string | undefined = undefined;

    // Upload new image to Cloudinary if provided
    if (file) {
      try {
        // Delete old image if exists
        if (part.imageUrl) {
          const publicId = this.cloudinaryService.extractPublicId(part.imageUrl);
          await this.cloudinaryService.deleteImage(publicId);
        }

        // Upload new image
        const uploadResult = await this.cloudinaryService.uploadImage(
          file,
          'auto-parts/parts',
        );
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestException('Failed to upload image');
      }
    }

    return this.prisma.part.update({
      where: { id },
      data: {
        ...updatePartDto,
        ...(imageUrl && { imageUrl }),
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    // Only seller who created the part or admin can delete
    if (part.sellerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to delete this part');
    }

    // Delete image from Cloudinary if exists
    if (part.imageUrl) {
      try {
        const publicId = this.cloudinaryService.extractPublicId(part.imageUrl);
        await this.cloudinaryService.deleteImage(publicId);
      } catch (error) {
        // Log error but don't fail the deletion
        console.error('Failed to delete image from Cloudinary:', error);
      }
    }

    return this.prisma.part.delete({
      where: { id },
    });
  }
}