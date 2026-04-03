/**
 * One-time script to create the SUPER_ADMIN account.
 *
 * Usage:
 *   SUPER_ADMIN_PASSWORD="YourSecurePassword" npx ts-node scripts/create-super-admin.ts
 *
 * The password MUST be passed via the environment variable to avoid it
 * being saved in shell history. Minimum 8 characters.
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@nubiatechnology.com';
const ADMIN_FIRST_NAME = 'Nubia';
const ADMIN_LAST_NAME = 'Admin';
const SALT_ROUNDS = 12;

async function main() {
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!password || password.length < 8) {
    console.error(
      '❌ Please provide a password (min 8 chars) via SUPER_ADMIN_PASSWORD env var.\n' +
        '   Example: SUPER_ADMIN_PASSWORD="MyStr0ng!Pass" npx ts-node scripts/create-super-admin.ts',
    );
    process.exit(1);
  }

  // Check if this admin already exists
  const existing = await prisma.admin.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true, adminCapabilities: true },
  });

  if (existing) {
    console.log(`⚠️  Admin ${ADMIN_EMAIL} already exists (id: ${existing.id})`);
    console.log(`   Capabilities: ${existing.adminCapabilities.join(', ')}`);

    // Update password and ensure SUPER_ADMIN capability
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await prisma.admin.update({
      where: { email: ADMIN_EMAIL },
      data: {
        password: hashedPassword,
        adminCapabilities: ['SUPER_ADMIN'],
        isActive: true,
      },
    });
    console.log('✅ Password updated and SUPER_ADMIN capability confirmed.');
    return;
  }

  // Create new super admin
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await prisma.admin.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      isActive: true,
      adminCapabilities: ['SUPER_ADMIN'],
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      adminCapabilities: true,
      createdAt: true,
    },
  });

  console.log('✅ Super Admin created successfully:');
  console.log(`   Email:        ${admin.email}`);
  console.log(`   Name:         ${admin.firstName} ${admin.lastName}`);
  console.log(`   Capabilities: ${admin.adminCapabilities.join(', ')}`);
  console.log(`   ID:           ${admin.id}`);
  console.log(`   Created:      ${admin.createdAt.toISOString()}`);
}

main()
  .catch((err) => {
    console.error('❌ Failed to create super admin:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
