#!/usr/bin/env ts-node

/**
 * CLI Script to update all existing admin accounts to have private profiles
 * Usage: npm run update-admin-privacy
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

async function updateAdminPrivacy(): Promise<void> {
  try {
    console.log(`\n🔄 Connecting to database...`);
    await AppDataSource.initialize();
    console.log(`✅ Database connected`);

    console.log(`\n🔍 Finding all admin users...`);

    const userRepository = AppDataSource.getRepository(User);

    // Get all admin users
    const adminUsers = await userRepository.find({ where: { role: UserRole.ADMIN } });

    if (adminUsers.length === 0) {
      console.log(`\n⚠️  No admin users found.`);
      await AppDataSource.destroy();
      process.exit(0);
    }

    console.log(`✅ Found ${adminUsers.length} admin user(s)`);

    let updatedCount = 0;

    // Update each admin to have private profile
    for (const admin of adminUsers) {
      if (!admin.profile_private) {
        admin.profile_private = true;
        await userRepository.save(admin);
        console.log(`   ✅ Updated: ${admin.email} - Profile is now PRIVATE`);
        updatedCount++;
      } else {
        console.log(`   ℹ️  Already private: ${admin.email}`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} admin account(s) to private`);
    console.log(`\n🔒 All admin profiles are now hidden from non-admin users forever.\n`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error updating admin privacy:', error.message);
    console.error('\nFull error:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the script
updateAdminPrivacy();
