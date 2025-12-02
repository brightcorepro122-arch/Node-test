import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PricesGateway } from '../client/gateway/prices.gateway';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@ApiCookieAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly pricesGateway: PricesGateway,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createClient(@Body() createClientDto: CreateClientDto) {
    const client = await this.adminService.createClient(createClientDto);
    return {
      message: 'Client created successfully',
      client: {
        id: client.id,
        email: client.email,
        role: client.role,
      },
    };
  }

  @Put('disable-socket/:clientId')
  @ApiOperation({ summary: 'Disable socket connection for a client' })
  @ApiResponse({ status: 200, description: 'Socket disabled successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async disableSocket(@Param('clientId') clientId: string) {
    const disconnected = await this.pricesGateway.disconnectClient(clientId);
    return {
      message: disconnected
        ? 'Client socket disconnected successfully'
        : 'Client was not connected',
      clientId,
    };
  }

  @Delete('remove/:clientId')
  @ApiOperation({ summary: 'Remove a client' })
  @ApiResponse({ status: 200, description: 'Client removed successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async removeClient(@Param('clientId') clientId: string) {
    // Disconnect socket first if connected
    await this.pricesGateway.disconnectClient(clientId);
    return this.adminService.removeClient(clientId);
  }
}

