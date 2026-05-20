import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start database seeding...');

  // 1. Clean existing records (Optional, but safe for repeated seeding)
  console.log('🗑️  Cleaning existing records...');
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash passwords
  console.log('🔑 Hashing seed passwords...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 3. Create Sample Admin User
  console.log('👤 Creating Admin user...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Alex Mercer',
      email: 'admin@manager.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 4. Create Sample Member User
  console.log('👤 Creating Member user...');
  const memberUser = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'member@manager.com',
      password: hashedPassword,
      role: 'MEMBER',
    },
  });

  // 5. Create Sample Project
  console.log('📂 Creating Sample Project...');
  const project = await prisma.project.create({
    data: {
      name: 'Phoenix Falcon Rebuild',
      description: 'System-wide architecture overhaul and visual system modernizations.',
    },
  });

  // 6. Add Members to Project
  console.log('🔗 Attaching memberships...');
  await prisma.projectMember.createMany({
    data: [
      { userId: adminUser.id, projectId: project.id },
      { userId: memberUser.id, projectId: project.id },
    ],
  });

  // 7. Create Sample Tasks
  console.log('📋 Creating Tasks...');
  await prisma.task.create({
    data: {
      title: 'Define Backend API Spec',
      description: 'Document endpoints, payload structures, schema, and security guards.',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in the future
      projectId: project.id,
      assignedTo: adminUser.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Integrate Tailwind V4 Theme',
      description: 'Configure standard modern colors, glassmorphism overlays, and layout systems.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in the future
      projectId: project.id,
      assignedTo: memberUser.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Conduct Performance Benchmark',
      description: 'Validate query roundtrips, database connection pool exhaustion, and indexing latency.',
      status: 'TODO',
      priority: 'LOW',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days in the future
      projectId: project.id,
      assignedTo: memberUser.id,
    },
  });

  console.log('✅ Seeding complete!');
  console.log(`===============================================`);
  console.log(`Created accounts:`);
  console.log(`  - Admin: ${adminUser.email} (password: password123)`);
  console.log(`  - Member: ${memberUser.email} (password: password123)`);
  console.log(`Created Project: "${project.name}"`);
  console.log(`===============================================`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
