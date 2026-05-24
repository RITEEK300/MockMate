import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppShell } from '../components/common/AppShell';
import { Button } from '../components/common/Button';
import { ModeCard } from '../components/dashboard/ModeCard';
import { useMatch } from '../hooks/useMatch';
import type { InterviewRole, InterviewType } from '../types';

const roleOptions: Array<{ label: string; value: InterviewRole | null }> = [
  { label: 'Auto assign', value: null },
  { label: 'Interviewer', value: 'INTERVIEWER' },
  { label: 'Candidate', value: 'CANDIDATE' }
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { enqueue, queueStatus, socketStatus } = useMatch();
  const [interviewType, setInterviewType] = useState<InterviewType>('HR');
  const [preferredRole, setPreferredRole] = useState<InterviewRole | null>(null);
  const [loading, setLoading] = useState(false);
  const helperText = useMemo(() => {
    if (socketStatus === 'connecting') {
      return 'Realtime channel boot ho raha hai...';
    }
    if (socketStatus === 'connected') {
      return 'Realtime matching ready.';
    }
    return 'Socket reconnecting. You can still queue.';
  }, [socketStatus]);

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="grid gap-5">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow">
            <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Launch pad</p>
            <h1 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.95] text-white">
              Choose the interview lane you want to sharpen today.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-mist/80">
              Pick the mock interview type, lock your preferred role if needed, then jump into the waiting room.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ModeCard
              type="HR"
              title="HR"
              description="Behavioral storytelling, confidence, clarity, conflict resolution, and culture-fit prompts."
              active={interviewType === 'HR'}
              onClick={setInterviewType}
            />
            <ModeCard
              type="TECHNICAL"
              title="Technical"
              description="System design, debugging, architecture tradeoffs, and code explanation conversations."
              active={interviewType === 'TECHNICAL'}
              onClick={setInterviewType}
            />
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate/75 p-6 shadow-glow">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-mint/80">Match setup</p>
            <h2 className="font-display text-3xl text-white">Dial in your session</h2>
            <p className="mt-3 text-sm leading-6 text-mist/75">{helperText}</p>
          </div>

          <div className="mb-6 grid gap-3">
            {roleOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setPreferredRole(option.value)}
                className={`min-h-11 rounded-2xl border px-4 py-3 text-left transition ${
                  preferredRole === option.value
                    ? 'border-mint bg-mint/10 text-white'
                    : 'border-white/10 bg-white/5 text-mist/75 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-mist/75">
            <div className="flex items-center justify-between">
              <span>Interview type</span>
              <span className="font-semibold text-white">{interviewType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Role preference</span>
              <span className="font-semibold text-white">{preferredRole ?? 'AUTO'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Queue status</span>
              <span className="font-semibold uppercase text-white">{queueStatus}</span>
            </div>
          </div>

          <Button
            className="mt-6 w-full"
            onClick={async () => {
              setLoading(true);
              try {
                await enqueue({ interviewType, preferredRole });
                navigate('/waiting', { state: { interviewType, preferredRole } });
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? 'Starting queue...' : 'Start matching'}
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
