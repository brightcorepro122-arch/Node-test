import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class AdminService {
  constructor(private usersService: UsersService) {}

  async createClient(createClientDto: CreateClientDto) {
    const hashedPassword = await bcrypt.hash(createClientDto.password, 10);
    return this.usersService.create(
      createClientDto.email,
      hashedPassword,
      UserRole.CLIENT,
    );
  }

  async removeClient(clientId: string) {
    const client = await this.usersService.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    if (client.role !== UserRole.CLIENT) {
      throw new Error('User is not a client');
    }
    await this.usersService.remove(clientId);
    return { message: 'Client removed successfully' };
  }
}

