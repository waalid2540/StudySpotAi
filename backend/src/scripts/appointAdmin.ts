#!/usr/bin/env ts-node

/**
 * CLI Script to appoint a user as admin
 * Usage: npm run appoint-admin <email>
 * Example: npm run appoint-admin admin@example.com
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/User';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize database connection
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.resolve(__dirname, '../entities/**/*.{ts,js}')],
  synchronize: false,
  logging: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function appointAdmin(email: string): Promise<void> {
  try {
    console.log(`\n🔄 Connecting to database...`);
    await AppDataSource.initialize();
    console.log(`✅ Database connected`);

    console.log(`\n🔍 Looking up user with email: ${email}...`);

    const userRepository = AppDataSource.getRepository(User);

    // Get user by email
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      console.error(`\n❌ Error: No user found with email: ${email}`);
      console.log(`\n💡 Tip: Make sure the user has registered first before appointing them as admin.\n`);
      await AppDataSource.destroy();
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
    console.log(`📋 Current role: ${user.role}`);

    if (user.role === UserRole.ADMIN) {
      console.log('⚠️  User is already an admin!');
      await AppDataSource.destroy();
      process.exit(0);
    }

    const previousRole = user.role;

    // Set admin role
    user.role = UserRole.ADMIN;
    await userRepository.save(user);

    console.log(`✅ Successfully appointed ${email} as admin!`);
    console.log(`\n👤 User Details:`);
    console.log(`   - Name: ${user.first_name} ${user.last_name}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Previous Role: ${previousRole}`);
    console.log(`   - New Role: ${user.role}`);
    console.log(`\n✨ The user will need to log out and log back in for changes to take effect.\n`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error appointing admin:', error.message);
    console.error('\nFull error:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('\n❌ Error: Email is required');
  console.log('\n📖 Usage: npm run appoint-admin <email>');
  console.log('   Example: npm run appoint-admin admin@example.com\n');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('\n❌ Error: Invalid email format');
  console.log(`   Provided: ${email}\n`);
  process.exit(1);
}

// Run the script
appointAdmin(email);
