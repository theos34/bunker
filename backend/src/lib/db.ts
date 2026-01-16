import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

export async function initializeDatabase() {
  // Create default KPI record if none exists
  const kpiCount = await db.kpi.count();
  if (kpiCount === 0) {
    await db.kpi.create({
      data: {
        mrr: 0,
        mrrGoal: 20000,
        activeSubscribers: 0,
      },
    });
  }

  // Create admin user if none exists
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  const existingAdmin = await db.user.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    const hashedPassword = await Bun.password.hash(adminPassword, {
      algorithm: 'bcrypt',
      cost: 10,
    });

    await db.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
      },
    });

    console.log(`Admin user '${adminUsername}' created`);
  }
}
