export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addHours } from 'date-fns';

export async function POST(request: Request) {
  try {
    const { userId, hoursReady } = await request.json(); // hoursReady should be 1, 3, 6, 12, 24 or 0 (to clear)

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (hoursReady === undefined) {
      return NextResponse.json({ error: 'hoursReady is required' }, { status: 400 });
    }

    let statusExpiresAt = null;
    if (hoursReady > 0) {
      statusExpiresAt = addHours(new Date(), hoursReady);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { statusExpiresAt }
    });

    return NextResponse.json({ success: true, statusExpiresAt });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
