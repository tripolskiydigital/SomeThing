'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initUser = async () => {
      try {
        const storedUserId = localStorage.getItem('userId');
        const storedCoupleId = localStorage.getItem('coupleId');

        if (storedUserId) {
          setUserId(storedUserId);
          if (storedCoupleId) setCoupleId(storedCoupleId);
          setLoading(false);
          return;
        }

        const res = await fetch('/api/user/init', { method: 'POST' });
        const data = await res.json();

        if (data.id) {
          localStorage.setItem('userId', data.id);
          setUserId(data.id);
        }
      } catch (err) {
        console.error('Failed to init user:', err);
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  const handleGenerateInvite = async () => {
    try {
      const res = await fetch('/api/couple/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      
      if (res.status === 404 && data.error === 'User not found') {
        localStorage.removeItem('userId');
        window.location.reload();
        return;
      }
      
      if (data.coupleId) {
        setGeneratedInvite(data.coupleId);
        setCoupleId(data.coupleId);
        localStorage.setItem('coupleId', data.coupleId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinCouple = async () => {
    try {
      setError(null);
      const res = await fetch('/api/couple/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coupleId: inviteCode })
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.success) {
        setCoupleId(data.coupleId);
        localStorage.setItem('coupleId', data.coupleId);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>;

  if (coupleId && userId) {
    return <Dashboard userId={userId} coupleId={coupleId} />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-white">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-zinc-900 p-8 shadow-2xl">
        <h1 className="text-center text-3xl font-bold tracking-tight text-rose-500">Intimacy App</h1>
        <p className="text-center text-sm text-zinc-400">Anonymous & Private</p>

        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 p-6 text-center transition hover:border-zinc-700">
            <h2 className="mb-4 text-xl font-semibold">Create a Couple</h2>
            <button
              onClick={handleGenerateInvite}
              className="w-full rounded-md bg-rose-600 px-4 py-2 font-medium text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              Generate Invite Code
            </button>
            
            {generatedInvite && (
              <div className="mt-6 flex flex-col items-center space-y-4">
                <p className="text-sm text-zinc-400">Scan this QR to join or share the code:</p>
                <div className="rounded-xl bg-white p-4">
                  <QRCode value={generatedInvite} size={150} />
                </div>
                <div className="rounded bg-zinc-800 px-3 py-2 font-mono text-sm tracking-wider text-zinc-300">
                  {generatedInvite}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500">Or</span>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 p-6 transition hover:border-zinc-700">
            <h2 className="mb-4 text-center text-xl font-semibold">Join a Couple</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleJoinCouple}
                disabled={!inviteCode}
                className="w-full rounded-md bg-zinc-700 px-4 py-2 font-medium text-white transition hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
