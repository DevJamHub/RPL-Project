import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEMO_USER_ID = 'demo@fintrack.com';

export async function GET() {
  try {
    const user = await prisma.user.findUnique({ where: { email: DEMO_USER_ID } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Format output to match existing frontend structure
    const formatted = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      category: t.category.name,
      categoryIcon: t.category.icon,
      categoryColor: t.category.color,
      description: t.description,
      date: t.date.toISOString().split('T')[0],
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await prisma.user.findUnique({ where: { email: DEMO_USER_ID } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { type, amount, categoryName, description, date } = body;

    // Find category by name
    const category = await prisma.category.findFirst({
      where: { userId: user.id, name: categoryName },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        type,
        amount,
        description,
        date: new Date(date),
      },
      include: { category: true },
    });

    return NextResponse.json({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category.name,
      categoryIcon: transaction.category.icon,
      categoryColor: transaction.category.color,
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0],
      createdAt: transaction.createdAt.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create transaction' }, { status: 500 });
  }
}
