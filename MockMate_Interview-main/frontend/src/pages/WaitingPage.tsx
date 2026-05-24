import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppShell } from '../components/common/AppShell';
import { Button } from '../components/common/Button';
import { StatusBanner } from '../components/interview/StatusBanner';
import { useMatch } from '../hooks/useMatch';
import type { MatchRequest } from '../types';

export function WaitingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRoom, cancel, enqueue, error, queueStatus, refreshStatus, roomNotice, socketStatus } = useMatch();
  const request = location.state as MatchRequest | undefined;

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (activeRoom) {
      navigate(`/interview/${activeRoom.roomId}`);
    }
  }, [activeRoom, navigate]);

  return (
    <AppShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <section className="grid gap-5 rounded-[36px] border border-white/10 bg-white/5 px-6 py-8 text-center shadow-glow">
          <div className="mx-auto grid h-32 w-32 place-items-center rounded-full border border-mint/40 bg-[radial-gradient(circle,_rgba(61,217,184,0.28)_0%,_rgba(255,255,255,0.02)_70%)]">
            <div className="h-16 w-16 animate-pulse rounded-full bg-coral/80" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Waiting screen</p>
            <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] text-white">Looking for your next mock mate.</h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-mist/75">
              No match yet? We keep the UI alive, show queue state, and recover gracefully when the network blinks.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate/70 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-mist/55">Queue</div>
              <div className="mt-2 font-display text-2xl text-white">{queueStatus}</div>
            </div>
            <div className="rounded-3xl bg-slate/70 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-mist/55">Realtime</div>
              <div className="mt-2 font-display text-2xl text-white">{socketStatus}</div>
            </div>
            <div className="rounded-3xl bg-slate/70 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-mist/55">Fallback</div>
              <div className="mt-2 text-sm text-mist/80">Manual retry enabled</div>
            </div>
          </div>
        </section>

        {roomNotice ? (
          <StatusBanner
            title="Peer disconnected"
            message="Your partner dropped out, so MockMate is ready to put you back in queue."
            tone="warning"
          />
        ) : null}

        {error ? (
          <StatusBanner
            title="Network retry"
            message={error}
            tone="warning"
          />
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="secondary"
            onClick={async () => {
              if (request) {
                await enqueue(request);
              } else {
                await refreshStatus();
              }
            }}
          >
            Retry / refresh
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              await cancel();
              navigate('/dashboard');
            }}
          >
            Cancel queue
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
