import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a dummy user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@fintrack.com' },
    update: {},
    create: {
      name: 'Demo Mahasiswa',
      email: 'demo@fintrack.com',
      password: hashedPassword,
      currency: 'IDR',
      budgetLimit: 3000000,
      alertEnabled: true,
    },
  });

  // 2. Create default categories
  const categories = [
    { name: 'Makan', type: 'EXPENSE', icon: 'utensils', color: '#EF4444' }, // Red
    { name: 'Transport', type: 'EXPENSE', icon: 'car', color: '#F59E0B' }, // Amber
    { name: 'Hiburan', type: 'EXPENSE', icon: 'film', color: '#8B5CF6' }, // Purple
    { name: 'Belanja Online', type: 'EXPENSE', icon: 'shopping-cart', color: '#EC4899' }, // Pink
    { name: 'Pendidikan', type: 'EXPENSE', icon: 'book', color: '#3B82F6' }, // Blue
    { name: 'Kesehatan', type: 'EXPENSE', icon: 'activity', color: '#10B981' }, // Green
    { name: 'Tabungan', type: 'EXPENSE', icon: 'piggy-bank', color: '#06B6D4' }, // Cyan
    { name: 'Lainnya (Keluar)', type: 'EXPENSE', icon: 'more-horizontal', color: '#6B7280' }, // Gray
    { name: 'Uang Saku', type: 'INCOME', icon: 'wallet', color: '#22C55E' }, // Green success
    { name: 'Beasiswa', type: 'INCOME', icon: 'award', color: '#6366F1' }, // Indigo
    { name: 'Kerja Part-time', type: 'INCOME', icon: 'briefcase', color: '#14B8A6' }, // Teal
    { name: 'Lainnya (Masuk)', type: 'INCOME', icon: 'more-horizontal', color: '#6B7280' }, // Gray
  ];

  const createdCategories = {};
  for (const cat of categories) {
    const createdCat = await prisma.category.create({
      data: {
        userId: user.id,
        name: cat.name,
        type: cat.type as 'EXPENSE' | 'INCOME',
        icon: cat.icon,
        color: cat.color,
      },
    });
    createdCategories[cat.name] = createdCat;
  }

  // 3. Create sample transactions for the last 2 months
  const now = new Date();
  const transactionsData = [];

  // Random number generator helper
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  for (let i = 0; i < 30; i++) {
    // Distribute transactions over the last 60 days
    const date = new Date(now);
    date.setDate(now.getDate() - randomInt(0, 60));

    const isIncome = Math.random() > 0.7; // 30% chance of income
    
    let categoryName = '';
    let amount = 0;
    let description = '';

    if (isIncome) {
      const incomeTypes = ['Uang Saku', 'Beasiswa', 'Kerja Part-time'];
      categoryName = incomeTypes[randomInt(0, incomeTypes.length - 1)];
      amount = randomInt(50, 200) * 10000; // 500k to 2M
      description = `Pendapatan dari ${categoryName}`;
    } else {
      const expenseTypes = ['Makan', 'Transport', 'Hiburan', 'Belanja Online', 'Pendidikan'];
      categoryName = expenseTypes[randomInt(0, expenseTypes.length - 1)];
      amount = randomInt(2, 50) * 10000; // 20k to 500k
      description = `Pengeluaran untuk ${categoryName}`;
    }

    transactionsData.push({
      userId: user.id,
      categoryId: createdCategories[categoryName].id,
      type: isIncome ? 'INCOME' : 'EXPENSE',
      amount,
      description,
      date,
    });
  }

  await prisma.transaction.createMany({
    data: transactionsData,
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
