import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppShell } from '../components/common/AppShell';
import { Button } from '../components/common/Button';
import { ChatPanel } from '../components/interview/ChatPanel';
import { QuestionPanel } from '../components/interview/QuestionPanel';
import { StatusBanner } from '../components/interview/StatusBanner';
import { VideoPanel } from '../components/interview/VideoPanel';
import { useAuth } from '../hooks/useAuth';
import { useInterviewTimer } from '../hooks/useInterviewTimer';
import { useMatch } from '../hooks/useMatch';
import { useWebRTC } from '../hooks/useWebRTC';

export function InterviewPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const {
    activeRoom,
    chatMessages,
    clearSignals,
    error,
    loadRoom,
    roomNotice,
    sendChat,
    sendSignal,
    signalMessages
  } = useMatch();

  useEffect(() => {
    if (roomId) {
      void loadRoom(roomId);
    }
  }, [loadRoom, roomId]);

  const room = activeRoom?.roomId === roomId ? activeRoom : null;
  const timer = useInterviewTimer(room?.durationSeconds ?? 0, Boolean(room));
  const webRtc = useWebRTC({
    roomId: room?.roomId ?? '',
    initiator: room?.initiator ?? false,
    signalMessages,
    sendSignal,
    clearSignals
  });

  if (!room || !auth) {
    return (
      <AppShell>
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-center text-white">
          Loading interview room...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid gap-5">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-glow">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-mist/55">{room.interviewType} mock interview</p>
              <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-white">
                You are the {room.assignedRole.toLowerCase()}.
              </h1>
              <p className="mt-2 text-sm leading-6 text-mist/75">
                Paired with {room.partnerName}. Mobile layout stacks video vertically; desktop flips into split-screen focus.
              </p>
            </div>
            <div className="grid gap-3 rounded-[28px] border border-white/10 bg-slate/70 px-4 py-4 text-sm text-mist/80 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-mist/55">Timer</div>
                <div className="mt-1 font-display text-3xl text-white">{timer.label}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-mist/55">Peer state</div>
                <div className="mt-1 font-semibold text-white">{webRtc.connectionState}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-mist/55">Room</div>
                <div className="mt-1 font-semibold text-white">{room.roomId.slice(0, 8)}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${timer.progress * 100}%` }} />
          </div>
        </section>

        {roomNotice ? (
          <StatusBanner
            title="Auto requeue ready"
            message="Your previous peer disconnected. Start a fresh session whenever you’re ready."
            tone="warning"
          />
        ) : null}

        {error || webRtc.error ? (
          <StatusBanner
            title="Connection hint"
            message={webRtc.error ?? error ?? 'Signal sync issue'}
            tone="warning"
          />
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
          <section className="grid gap-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <VideoPanel title="You" subtitle={room.assignedRole} stream={webRtc.localStream} muted />
              <VideoPanel title={room.partnerName} subtitle="Peer" stream={webRtc.remoteStream} />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Button variant="secondary" onClick={webRtc.toggleMic}>
                {webRtc.micEnabled ? 'Mute mic' : 'Unmute mic'}
              </Button>
              <Button variant="ghost" onClick={webRtc.toggleCamera}>
                {webRtc.cameraEnabled ? 'Stop camera' : 'Start camera'}
              </Button>
              <Button variant="ghost" onClick={() => void webRtc.retryConnection()}>
                Retry connection
              </Button>
              <Button
                variant="danger"
                onClick={() => navigate('/feedback', { state: { room } })}
              >
                End & rate
              </Button>
            </div>
            <QuestionPanel questions={room.questions} role={room.assignedRole} />
          </section>

          <section className="grid gap-5">
            <ChatPanel
              messages={chatMessages}
              currentUserId={auth.userId}
              onSend={(message) => sendChat(room.roomId, message)}
            />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
