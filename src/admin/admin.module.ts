import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [UsersModule, ClientModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

