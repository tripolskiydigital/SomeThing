import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, coupleId } = await request.json();

    if (!userId || !coupleId) {
      return NextResponse.json({ error: 'User ID and Couple ID are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
      include: { users: true }
    });

    if (!couple) {
      return NextResponse.json({ error: 'Couple not found' }, { status: 404 });
    }

    if (couple.users.length >= 2) {
      // Check if the current user is already part of the couple
      const isMember = couple.users.some(u => u.id === userId);
      if (!isMember) {
        return NextResponse.json({ error: 'Couple is already full' }, { status: 400 });
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { coupleId }
    });

    return NextResponse.json({ success: true, coupleId });
  } catch (error) {
    console.error('Error joining couple:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
