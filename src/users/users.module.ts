import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // O registo explícito resolve a dependência do AuthModuleOptions
  ],
  controllers: [UsersController],
  providers: [UsersService], // <-- Confirma que o JwtAuthGuard NÃO está nesta lista
  exports: [UsersService],
})
export class UsersModule {}