import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEMO_USER_ID = 'demo@fintrack.com';

export async function GET() {
  try {
    const user = await prisma.user.findUnique({ where: { email: DEMO_USER_ID } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await prisma.user.findUnique({ where: { email: DEMO_USER_ID } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { name, budgetLimit } = body;

    const category = await prisma.category.updateMany({
      where: { userId: user.id, name },
      data: { budgetLimit },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category budget' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await prisma.user.findUnique({ where: { email: DEMO_USER_ID } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await request.json();
    const { name, type, icon, color, budgetLimit } = body;

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name,
        type,
        icon,
        color,
        budgetLimit,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
