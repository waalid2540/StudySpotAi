#!/usr/bin/env ts-node

/**
 * CLI Script to appoint a user as admin
 * Usage: npm run appoint-admin <email>
 * Example: npm run appoint-admin admin@example.com
 */

import admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? require(path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH))
      : undefined;

    admin.initializeApp({
      credential: serviceAccount
        ? admin.credential.cert(serviceAccount)
        : admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

async function appointAdmin(email: string): Promise<void> {
  try {
    console.log(`\n🔍 Looking up user with email: ${email}...`);

    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    console.log(`✅ Found user: ${user.displayName || user.email} (UID: ${user.uid})`);

    // Check current role
    const currentClaims = user.customClaims || {};
    const currentRole = currentClaims.role || 'student';

    console.log(`📋 Current role: ${currentRole}`);

    if (currentRole === 'admin') {
      console.log('⚠️  User is already an admin!');
      process.exit(0);
    }

    // Set admin role
    await admin.auth().setCustomUserClaims(user.uid, {
      ...currentClaims,
      role: 'admin',
    });

    console.log(`✅ Successfully appointed ${email} as admin!`);
    console.log(`\n👤 User Details:`);
    console.log(`   - Name: ${user.displayName || 'N/A'}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - UID: ${user.uid}`);
    console.log(`   - Previous Role: ${currentRole}`);
    console.log(`   - New Role: admin`);
    console.log(`\n✨ The user will need to log out and log back in for changes to take effect.\n`);

    process.exit(0);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ Error: No user found with email: ${email}`);
      console.log(`\n💡 Tip: Make sure the user has registered first before appointing them as admin.\n`);
    } else {
      console.error('\n❌ Error appointing admin:', error.message);
      console.error('\nFull error:', error);
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
