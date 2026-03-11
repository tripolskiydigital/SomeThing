'use client';

import { useState, useEffect } from 'react';
import { differenceInMinutes, parseISO } from 'date-fns';
import { Clock, Heart, Flame, Sparkles, Check, Settings2, Share2, Info } from 'lucide-react';
import QRCode from 'react-qr-code';

const PREFERENCES_LIST = [
  'BDSM', 'Roleplay', 'Toys', 'Bondage', 'Lingerie', 
  'Massage', 'Public', 'Edging', 'Sensory Deprivation'
];

export default function Dashboard({ userId, coupleId }: { userId: string; coupleId: string }) {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'status' | 'preferences'>('status');
  
  // Status inputs
  const [selectedHours, setSelectedHours] = useState<number | null>(null);

  // Preference inputs
  const [myPreferences, setMyPreferences] = useState<string[]>([]);
  const [myWantToTry, setMyWantToTry] = useState<string[]>([]);

  // Polling
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/couple/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, coupleId })
        });
        const data = await res.json();
        if (!data.error) {
          setState(data);
          setMyPreferences(data.myPreferences || []);
          setMyWantToTry(data.myWantToTry || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [userId, coupleId]);

  const updateStatus = async (hours: number) => {
    setSelectedHours(hours);
    try {
      await fetch('/api/user/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, hoursReady: hours })
      });
      // Force refresh state immediately after
      const res = await fetch('/api/couple/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coupleId })
      });
      setState(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const updatePreferences = async (prefs: string[], wants: string[]) => {
    setMyPreferences(prefs);
    setMyWantToTry(wants);
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, preferences: prefs, wantToTry: wants })
      });
      // Refresh state
      const res = await fetch('/api/couple/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coupleId })
      });
      setState(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const togglePreference = (item: string) => {
    const newPrefs = myPreferences.includes(item) 
      ? myPreferences.filter(p => p !== item)
      : [...myPreferences, item];
    updatePreferences(newPrefs, myWantToTry);
  };

  const toggleWantToTry = (item: string) => {
    const newWants = myWantToTry.includes(item)
      ? myWantToTry.filter(w => w !== item)
      : [...myWantToTry, item];
    updatePreferences(myPreferences, newWants);
  };

  if (loading || !state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex animate-pulse flex-col items-center">
          <Heart className="h-12 w-12 text-rose-500" />
          <p className="mt-4 text-zinc-400">Syncing connection...</p>
        </div>
      </div>
    );
  }

  // Calculate remaining time for self status
  let remainingMinutes = 0;
  if (state.myStatusExpiresAt) {
    const expiry = parseISO(state.myStatusExpiresAt);
    const now = new Date();
    if (expiry > now) {
      remainingMinutes = differenceInMinutes(expiry, now);
    }
  }
  const isCurrentlyReady = remainingMinutes > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-rose-500/30">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-rose-500" fill="currentColor" />
            <h1 className="text-xl font-bold tracking-tight">Bonded</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`h-2 w-2 rounded-full ${state.isPartnerConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
            <span className={state.isPartnerConnected ? 'text-zinc-300' : 'text-zinc-500'}>
              {state.isPartnerConnected ? 'Partner Connected' : 'Waiting for Partner'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto flex max-w-2xl border-t border-zinc-800/50">
          <button 
            onClick={() => setActiveTab('status')}
            className={`flex flex-1 items-center justify-center py-3 text-sm font-medium transition-colors ${activeTab === 'status' ? 'border-b-2 border-rose-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Clock className="mr-2 h-4 w-4" /> Intimacy Status
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`flex flex-1 items-center justify-center py-3 text-sm font-medium transition-colors ${activeTab === 'preferences' ? 'border-b-2 border-rose-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Settings2 className="mr-2 h-4 w-4" /> Preferences & Matches
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 p-4 pt-8">
        {!state.isPartnerConnected && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center shadow-lg">
            <Share2 className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invite your partner</h2>
            <p className="text-zinc-400 mb-6 text-sm">Have them scan this QR code or enter your Couple ID on their device.</p>
            <div className="mx-auto w-fit rounded-xl bg-white p-4 shadow-sm mb-4">
              <QRCode value={coupleId} size={150} />
            </div>
            <div className="inline-block rounded-lg bg-zinc-800 px-4 py-2 font-mono text-lg tracking-wider text-rose-400">
              {coupleId}
            </div>
          </div>
        )}

        {state.isPartnerConnected && activeTab === 'status' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Match Alert */}
            {state.isMatchReady && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-600 p-6 text-center shadow-2xl shadow-rose-500/20">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <Flame className="mx-auto mb-3 h-12 w-12 animate-pulse text-white drop-shadow-md" />
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">It's a Match!</h2>
                <p className="text-rose-100 font-medium">Both you and your partner are in the mood.</p>
              </div>
            )}

            {/* Status Controls */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-xl">
              <div className="mb-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Signal Your Desire</h3>
                <p className="text-sm text-zinc-400">How long will you be in the mood?</p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[1, 3, 6, 12, 24].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => updateStatus(hours)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isCurrentlyReady && selectedHours === hours
                        ? 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xl font-bold">{hours}</span>
                    <span className="text-xs font-medium uppercase tracking-wider opacity-70">hrs</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 flex items-center justify-between rounded-lg bg-zinc-950/50 p-4 border border-zinc-800/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`h-3 w-3 rounded-full ${isCurrentlyReady ? 'bg-emerald-500' : 'bg-zinc-600'}`}></div>
                    {isCurrentlyReady && <div className="absolute inset-0 h-3 w-3 rounded-full bg-emerald-500 animate-ping opacity-75"></div>}
                  </div>
                  <span className="text-sm font-medium text-zinc-300">
                    {isCurrentlyReady ? 'You are currently open' : 'You are currently closed'}
                  </span>
                </div>
                {isCurrentlyReady && (
                  <button 
                    onClick={() => updateStatus(0)}
                    className="text-xs text-zinc-500 hover:text-rose-400 transition-colors underline underline-offset-4"
                  >
                    Cancel Signal
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {state.isPartnerConnected && activeTab === 'preferences' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Matches Display */}
            {(state.sharedPreferences.length > 0 || state.sharedWantToTry.length > 0 || state.oneWantsToTryOtherPrefers.length > 0) ? (
              <div className="space-y-4">
                <h3 className="flex items-center text-lg font-semibold text-rose-400">
                  <Sparkles className="mr-2 h-5 w-5" /> Your Matches
                </h3>
                
                {state.sharedPreferences.length > 0 && (
                  <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5 shadow-sm">
                    <h4 className="mb-3 text-sm font-medium text-emerald-400 flex items-center">
                      <Check className="mr-1.5 h-4 w-4" /> Both Prefer
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {state.sharedPreferences.map((p: string) => (
                        <span key={p} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm text-emerald-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {state.sharedWantToTry.length > 0 && (
                  <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-5 shadow-sm">
                    <h4 className="mb-3 text-sm font-medium text-amber-400 flex items-center">
                      <Flame className="mr-1.5 h-4 w-4" /> Both Want to Try
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {state.sharedWantToTry.map((w: string) => (
                        <span key={w} className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-sm text-amber-300">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {state.oneWantsToTryOtherPrefers.length > 0 && (
                  <div className="rounded-xl border border-fuchsia-900/50 bg-fuchsia-950/20 p-5 shadow-sm">
                    <h4 className="mb-3 text-sm font-medium text-fuchsia-400 flex items-center">
                      <Sparkles className="mr-1.5 h-4 w-4" /> Perfect Complements
                    </h4>
                    <p className="text-xs text-zinc-500 mb-3 ml-5">One of you prefers it, the other wants to try it.</p>
                    <div className="flex flex-wrap gap-2">
                      {state.oneWantsToTryOtherPrefers.map((w: string) => (
                        <span key={w} className="rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-1 text-sm text-fuchsia-300">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
                <Info className="mx-auto h-8 w-8 text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-400">Fill out your preferences below to see secret matches with your partner. Nothing is shared unless there is overlap!</p>
              </div>
            )}

            <hr className="border-zinc-800" />

            {/* Preference Selection */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-1 text-lg font-semibold">Your Profile</h3>
                <p className="mb-6 text-sm text-zinc-500">Select what you like and what you're curious about. Your partner will only see these if they select them too.</p>
              </div>

              <div className="space-y-4">
                {PREFERENCES_LIST.map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-colors hover:bg-zinc-900/50">
                    <span className="font-medium text-zinc-200">{item}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => togglePreference(item)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                          myPreferences.includes(item)
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        {myPreferences.includes(item) ? 'I Like This' : 'Like'}
                      </button>
                      <button
                        onClick={() => toggleWantToTry(item)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                          myWantToTry.includes(item)
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        {myWantToTry.includes(item) ? 'Curious' : 'Curious'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
