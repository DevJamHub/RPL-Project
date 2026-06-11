import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.transaction.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, amount, categoryName, description, date } = body;

    let categoryId;
    if (categoryName) {
      const existingTransaction = await prisma.transaction.findUnique({ where: { id } });
      if (existingTransaction) {
        const category = await prisma.category.findFirst({
          where: { userId: existingTransaction.userId, name: categoryName },
        });
        if (category) {
          categoryId = category.id;
        }
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(amount !== undefined && { amount }),
        ...(categoryId && { categoryId }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}
