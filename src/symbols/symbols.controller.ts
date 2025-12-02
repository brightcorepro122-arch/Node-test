import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { SymbolsService } from './symbols.service';
import { CreateSymbolDto } from './dto/create-symbol.dto';
import { UpdateSymbolDto } from './dto/update-symbol.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Symbols')
@Controller('symbols')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiCookieAuth()
export class SymbolsController {
  constructor(private readonly symbolsService: SymbolsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new symbol (Admin only)' })
  @ApiResponse({ status: 201, description: 'Symbol created successfully' })
  async create(@Body() createSymbolDto: CreateSymbolDto) {
    return this.symbolsService.create(createSymbolDto);
  }

  @Post('all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all symbols with pagination (Admin only)' })
  @ApiResponse({ status: 200, description: 'Symbols retrieved successfully' })
  async findAll(@Body() paginationDto: PaginationDto) {
    return this.symbolsService.findAll(paginationDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a symbol by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Symbol retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Symbol not found' })
  async findOne(@Param('id') id: string) {
    return this.symbolsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a symbol (Admin only)' })
  @ApiResponse({ status: 200, description: 'Symbol updated successfully' })
  @ApiResponse({ status: 404, description: 'Symbol not found' })
  async update(@Param('id') id: string, @Body() updateSymbolDto: UpdateSymbolDto) {
    return this.symbolsService.update(id, updateSymbolDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a symbol (Admin only)' })
  @ApiResponse({ status: 200, description: 'Symbol deleted successfully' })
  @ApiResponse({ status: 404, description: 'Symbol not found' })
  async remove(@Param('id') id: string) {
    await this.symbolsService.remove(id);
    return { message: 'Symbol deleted successfully' };
  }
}

