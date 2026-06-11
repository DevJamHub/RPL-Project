import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Hardcode user ID sementara sampai fitur login selesai
const DEMO_USER_ID = 'demo@fintrack.com'; // We'll query by email for the demo user

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_ID },
    });
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { budgetLimit } = body;

    const user = await prisma.user.update({
      where: { email: DEMO_USER_ID },
      data: { budgetLimit },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
