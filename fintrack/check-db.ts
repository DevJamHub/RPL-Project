import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const txs = await prisma.transaction.findMany({
    include: { category: true }
  });
  console.log("Total txs:", txs.length);
  for (const t of txs) {
    if (!t.category) {
      console.log("Tx missing category:", t.id);
    }
    if (!t.date || isNaN(new Date(t.date).getTime())) {
      console.log("Tx invalid date:", t.id, t.date);
    }
  }
}

main().finally(() => prisma.$disconnect());
