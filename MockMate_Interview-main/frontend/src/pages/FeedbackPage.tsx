import { useLocation, useNavigate } from 'react-router-dom';

import { AppShell } from '../components/common/AppShell';
import { FeedbackForm } from '../components/feedback/FeedbackForm';
import { feedbackApi } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useMatch } from '../hooks/useMatch';
import type { RoomState } from '../types';

export function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const { activeRoom, resetSession } = useMatch();
  const room = (location.state as { room?: RoomState } | undefined)?.room ?? activeRoom;

  if (!auth || !room) {
    return (
      <AppShell>
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-center text-white">
          No active interview found for feedback.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-4xl gap-6">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Wrap-up</p>
          <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-white">
            Share feedback for {room.partnerName}.
          </h1>
          <p className="mt-4 text-base leading-7 text-mist/80">
            Keep it concrete: what helped, what felt weak, and what they should improve before the next round.
          </p>
        </section>

        <FeedbackForm
          roomId={room.roomId}
          targetUserId={room.partnerId}
          onSubmit={async (payload) => {
            await feedbackApi.submit(payload, auth.token);
            resetSession();
            navigate('/dashboard');
          }}
        />
      </div>
    </AppShell>
  );
}
