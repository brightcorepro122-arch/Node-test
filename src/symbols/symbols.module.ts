import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolsController } from './symbols.controller';
import { SymbolsService } from './symbols.service';
import { Symbol } from './entities/symbol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Symbol])],
  controllers: [SymbolsController],
  providers: [SymbolsService],
  exports: [SymbolsService],
})
export class SymbolsModule {}

