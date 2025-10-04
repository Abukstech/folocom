import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { PartsModule } from './parts/parts.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [PrismaModule, UsersModule, CategoriesModule, PartsModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
