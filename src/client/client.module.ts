import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { PricesGateway } from './gateway/prices.gateway';
import { SymbolsModule } from '../symbols/symbols.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SymbolsModule, UsersModule, AuthModule],
  controllers: [ClientController],
  providers: [ClientService, PricesGateway],
  exports: [PricesGateway],
})
export class ClientModule {}

