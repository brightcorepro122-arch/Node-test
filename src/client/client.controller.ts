import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { ClientService } from './client.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Client')
@Controller('client')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
@ApiBearerAuth()
@ApiCookieAuth()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current client information' })
  @ApiResponse({ status: 200, description: 'Client information retrieved successfully' })
  async getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  @Get('symbols')
  @ApiOperation({ summary: 'Get available public symbols' })
  @ApiResponse({ status: 200, description: 'Symbols retrieved successfully' })
  async getSymbols() {
    return this.clientService.getPublicSymbols();
  }
}

