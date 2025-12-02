import { Injectable } from '@nestjs/common';
import { SymbolsService } from '../symbols/symbols.service';

@Injectable()
export class ClientService {
  constructor(private symbolsService: SymbolsService) {}

  async getPublicSymbols() {
    return this.symbolsService.findPublic();
  }
}

