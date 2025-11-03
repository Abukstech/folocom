import { Module } from '@nestjs/common';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloundinary.module';


@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [PartsController],
  providers: [PartsService],
  exports: [PartsService],
})
export class PartsModule {}
