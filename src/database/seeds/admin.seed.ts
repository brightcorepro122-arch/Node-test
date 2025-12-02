import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';

@Injectable()
export class AdminSeed {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async seed() {
    const adminEmail = this.configService.get('DEFAULT_ADMIN_EMAIL') || 'admin@example.com';
    const existingAdmin = await this.usersRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const adminPassword = this.configService.get('DEFAULT_ADMIN_PASSWORD') || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = this.usersRepository.create({
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await this.usersRepository.save(admin);
    console.log(`Default admin created: ${adminEmail}`);
  }
}

