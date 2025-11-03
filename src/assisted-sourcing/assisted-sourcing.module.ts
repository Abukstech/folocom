import { Module } from '@nestjs/common';
import { AssistedSourcingService } from './assisted-sourcing.service';
import { AssistedSourcingController } from './assisted-sourcing.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloundinary.module';


@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [AssistedSourcingController],
  providers: [AssistedSourcingService],
  exports: [AssistedSourcingService],
})
export class AssistedSourcingModule {}
