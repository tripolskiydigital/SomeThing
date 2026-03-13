export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, coupleId } = await request.json();

    if (!userId || !coupleId) {
      return NextResponse.json({ error: 'User ID and Couple ID are required' }, { status: 400 });
    }

    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
      include: { users: true }
    });

    if (!couple) {
      return NextResponse.json({ error: 'Couple not found' }, { status: 404 });
    }

    const currentUser = couple.users.find(u => u.id === userId);
    const partner = couple.users.find(u => u.id !== userId);

    if (!currentUser) {
      return NextResponse.json({ error: 'User is not part of this couple' }, { status: 403 });
    }

    const state: any = {
      isPartnerConnected: !!partner,
      isMatchReady: false,
      sharedPreferences: [],
      sharedWantToTry: [],
      oneWantsToTryOtherPrefers: [],
      myStatusExpiresAt: currentUser.statusExpiresAt,
      myPreferences: JSON.parse(currentUser.preferences || '[]'),
      myWantToTry: JSON.parse(currentUser.wantToTry || '[]'),
    };

    if (partner) {
      // Check readiness
      const now = new Date();
      const meReady = currentUser.statusExpiresAt && new Date(currentUser.statusExpiresAt) > now;
      const partnerReady = partner.statusExpiresAt && new Date(partner.statusExpiresAt) > now;
      state.isMatchReady = meReady && partnerReady;

      // Parse arrays safely
      const myPrefs = JSON.parse(currentUser.preferences || '[]');
      const myWants = JSON.parse(currentUser.wantToTry || '[]');
      const partnerPrefs = JSON.parse(partner.preferences || '[]');
      const partnerWants = JSON.parse(partner.wantToTry || '[]');

      // 1. Shared preferences (both have in preferences)
      state.sharedPreferences = myPrefs.filter((p: string) => partnerPrefs.includes(p));

      // 2. Shared want to try (both have in wantToTry)
      state.sharedWantToTry = myWants.filter((w: string) => partnerWants.includes(w));

      // 3. One wants to try and other prefers (or vice-versa)
      // If I want to try it, and partner prefers it OR partner wants to try it and I prefer it
      const myWantPartnerPrefers = myWants.filter((w: string) => partnerPrefs.includes(w));
      const partnerWantMyPrefers = partnerWants.filter((w: string) => myPrefs.includes(w));
      
      const mixed = Array.from(new Set([...myWantPartnerPrefers, ...partnerWantMyPrefers]));
      state.oneWantsToTryOtherPrefers = mixed;
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error('Error fetching couple state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
