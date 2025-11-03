import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { PartsModule } from './parts/parts.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AssistedSourcingModule } from './assisted-sourcing/assisted-sourcing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    CategoriesModule,
    PartsModule,
    OrdersModule,
    AuthModule,
    AssistedSourcingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
