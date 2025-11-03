import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';

  import { UpdateAssistedSourcingDto } from './dto/update-assisted-sourcing.dto';

  import { QueryAssistedSourcingDto } from './dto/query-assisted-sourcing.dto';
  import { Role, SourcingStatus } from '@prisma/client';
import { CreateAssistedSourcingDto } from './dto/create-assisted.dto';
import { AdminUpdateSourcingDto } from './dto/admin-update.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
  
  @Injectable()
  export class AssistedSourcingService {
    constructor(
      private prisma: PrismaService,
      private cloudinaryService: CloudinaryService,
    ) {}
  
    async create(
      userId: string,
      createDto: CreateAssistedSourcingDto,
      file?: Express.Multer.File,
    ) {
      let imageUrl: string | null = null;
  
      if (file) {
        try {
          const uploadResult = await this.cloudinaryService.uploadImage(
            file,
            'auto-parts/assisted-sourcing',
          );
          imageUrl = uploadResult.secure_url;
        } catch (error) {
          throw new BadRequestException('Failed to upload image');
        }
      }
  
      return this.prisma.assistedSourcing.create({
        data: {
          ...createDto,
          userId,
          imageUrl,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });
    }
  
    async findAll(queryDto: QueryAssistedSourcingDto, userRole: Role) {
      const { status, page = 1, limit = 10 } = queryDto;
      const skip = (page - 1) * limit;
  
      const where: any = {};
  
      if (status) {
        where.status = status;
      }
  
      const [requests, total] = await Promise.all([
        this.prisma.assistedSourcing.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.assistedSourcing.count({ where }),
      ]);
  
      return {
        data: requests,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    async findMyRequests(userId: string, page = 1, limit = 10) {
      const skip = (page - 1) * limit;
  
      const [requests, total] = await Promise.all([
        this.prisma.assistedSourcing.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.assistedSourcing.count({ where: { userId } }),
      ]);
  
      return {
        data: requests,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  
    async findOne(id: string, userId: string, userRole: Role) {
      const request = await this.prisma.assistedSourcing.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });
  
      if (!request) {
        throw new NotFoundException('Assisted sourcing request not found');
      }
  
      // Only the owner or admin can view the request
      if (request.userId !== userId && userRole !== Role.ADMIN) {
        throw new ForbiddenException(
          'You are not authorized to view this request',
        );
      }
  
      return request;
    }
  
    async update(
      id: string,
      userId: string,
      userRole: Role,
      updateDto: UpdateAssistedSourcingDto,
      file?: Express.Multer.File,
    ) {
      const request = await this.prisma.assistedSourcing.findUnique({
        where: { id },
      });
  
      if (!request) {
        throw new NotFoundException('Assisted sourcing request not found');
      }
  
      // Only the owner can update their request (not admin)
      if (request.userId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to update this request',
        );
      }
  
      // Users can only update if status is PENDING or CANCELLED
      if (
        request.status !== SourcingStatus.PENDING &&
        request.status !== SourcingStatus.CANCELLED
      ) {
        throw new BadRequestException(
          'Cannot update request after admin has started processing',
        );
      }
  
      let imageUrl: string | undefined = undefined;
  
      if (file) {
        try {
          // Delete old image if exists
          if (request.imageUrl) {
            const publicId =
              this.cloudinaryService.extractPublicId(request.imageUrl);
            await this.cloudinaryService.deleteImage(publicId);
          }
  
          // Upload new image
          const uploadResult = await this.cloudinaryService.uploadImage(
            file,
            'auto-parts/assisted-sourcing',
          );
          imageUrl = uploadResult.secure_url;
        } catch (error) {
          throw new BadRequestException('Failed to upload image');
        }
      }
  
      return this.prisma.assistedSourcing.update({
        where: { id },
        data: {
          ...updateDto,
          ...(imageUrl && { imageUrl }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });
    }
  
    async adminUpdate(id: string, adminUpdateDto: AdminUpdateSourcingDto) {
      const request = await this.prisma.assistedSourcing.findUnique({
        where: { id },
      });
  
      if (!request) {
        throw new NotFoundException('Assisted sourcing request not found');
      }
  
      return this.prisma.assistedSourcing.update({
        where: { id },
        data: {
          ...adminUpdateDto,
          ...(adminUpdateDto.estimatedDelivery && {
            estimatedDelivery: new Date(adminUpdateDto.estimatedDelivery),
          }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });
    }
  
    async acceptQuote(id: string, userId: string) {
      const request = await this.prisma.assistedSourcing.findUnique({
        where: { id },
      });
  
      if (!request) {
        throw new NotFoundException('Assisted sourcing request not found');
      }
  
      if (request.userId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to accept this quote',
        );
      }
  
      if (request.status !== SourcingStatus.QUOTED) {
        throw new BadRequestException('This request has not been quoted yet');
      }
  
      return this.prisma.assistedSourcing.update({
        where: { id },
        data: { status: SourcingStatus.ACCEPTED },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });
    }
  
    async cancel(id: string, userId: string, userRole: Role) {
      const request = await this.prisma.assistedSourcing.findUnique({
        where: { id },
      });
  
      if (!request) {
        throw new NotFoundException('Assisted sourcing request not found');
      }
  
      // Only the owner or admin can cancel
      if (request.userId !== userId && userRole !== Role.ADMIN) {
        throw new ForbiddenException(
          'You are not authorized to cancel this request',
        );
      }
  
      // Cannot cancel if already completed
      if (request.status === SourcingStatus.COMPLETED) {
        throw new BadRequestException('Cannot cancel a completed request');
      }
  
      return this.prisma.assistedSourcing.update({
        where: { id },
        data: { status: SourcingStatus.CANCELLED },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });
    }
  
    async remove(id: string, userId: string, userRole: Role) {
      const request = await this.prisma.assistedSourcing.findUnique({
        where: { id },
      });
  
      if (!request) {
        throw new NotFoundException('Assisted sourcing request not found');
      }
  
      // Only the owner or admin can delete
      if (request.userId !== userId && userRole !== Role.ADMIN) {
        throw new ForbiddenException(
          'You are not authorized to delete this request',
        );
      }
  
      // Delete image from Cloudinary if exists
      if (request.imageUrl) {
        try {
          const publicId =
            this.cloudinaryService.extractPublicId(request.imageUrl);
          await this.cloudinaryService.deleteImage(publicId);
        } catch (error) {
          console.error('Failed to delete image from Cloudinary:', error);
        }
      }
  
      return this.prisma.assistedSourcing.delete({
        where: { id },
      });
    }
  }
