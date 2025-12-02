import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Symbol } from './entities/symbol.entity';
import { CreateSymbolDto } from './dto/create-symbol.dto';
import { UpdateSymbolDto } from './dto/update-symbol.dto';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';

@Injectable()
export class SymbolsService {
  constructor(
    @InjectRepository(Symbol)
    private symbolsRepository: Repository<Symbol>,
  ) {}

  async create(createSymbolDto: CreateSymbolDto): Promise<Symbol> {
    const symbol = this.symbolsRepository.create({
      name: createSymbolDto.name,
      public: createSymbolDto.public ?? false,
      price: createSymbolDto.price ?? 0,
    });
    return this.symbolsRepository.save(symbol);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Symbol>> {
    const { page = 1, count = 10 } = paginationDto;
    const skip = (page - 1) * count;

    const [data, total] = await this.symbolsRepository.findAndCount({
      skip,
      take: count,
      order: { createdAt: 'DESC' },
    });

    const lastPage = Math.ceil(total / count);

    return {
      data,
      total,
      page,
      count,
      lastPage,
    };
  }

  async findOne(id: string): Promise<Symbol> {
    const symbol = await this.symbolsRepository.findOne({ where: { id } });
    if (!symbol) {
      throw new NotFoundException('Symbol not found');
    }
    return symbol;
  }

  async findPublic(): Promise<Symbol[]> {
    return this.symbolsRepository.find({
      where: { public: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateSymbolDto: UpdateSymbolDto): Promise<Symbol> {
    const symbol = await this.findOne(id);
    Object.assign(symbol, updateSymbolDto);
    return this.symbolsRepository.save(symbol);
  }

  async remove(id: string): Promise<void> {
    const symbol = await this.findOne(id);
    await this.symbolsRepository.remove(symbol);
  }
}

