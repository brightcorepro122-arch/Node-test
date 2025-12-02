import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

async function runSeeds() {
  const configService = new ConfigService();
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST') || 'localhost',
    port: configService.get('DB_PORT') || 5432,
    username: configService.get('DB_USER') || 'postgres',
    password: configService.get('DB_PASSWORD') || 'postgres',
    database: configService.get('DB_NAME') || 'node_test',
    entities: [User],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const userRepository = dataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: configService.get('DEFAULT_ADMIN_EMAIL') || 'admin@example.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await dataSource.destroy();
      return;
    }

    // Create default admin
    const adminEmail = configService.get('DEFAULT_ADMIN_EMAIL') || 'admin@example.com';
    const adminPassword = configService.get('DEFAULT_ADMIN_PASSWORD') || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await userRepository.save(admin);
    console.log(`Default admin created: ${adminEmail}`);

    await dataSource.destroy();
    console.log('Seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeeds();

