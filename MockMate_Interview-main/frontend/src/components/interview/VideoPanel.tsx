import { useEffect, useRef } from 'react';

export function VideoPanel({
  title,
  subtitle,
  stream,
  muted = false
}: {
  title: string;
  subtitle: string;
  stream: MediaStream | null;
  muted?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-slate/80 shadow-glow">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h3 className="font-display text-lg text-white">{title}</h3>
          <p className="text-xs uppercase tracking-[0.2em] text-mist/60">{subtitle}</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-mist/80">
          {stream ? 'Live' : 'Connecting'}
        </span>
      </div>
      <div className="aspect-[4/3] bg-[linear-gradient(135deg,_rgba(61,217,184,0.18),_rgba(255,141,109,0.16))]">
        <video ref={videoRef} autoPlay playsInline muted={muted} className="h-full w-full object-cover" />
      </div>
    </article>
  );
}
