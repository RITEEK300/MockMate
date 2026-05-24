import type { InterviewType } from '../../types';

export function ModeCard({
  type,
  title,
  description,
  active,
  onClick
}: {
  type: InterviewType;
  title: string;
  description: string;
  active: boolean;
  onClick: (type: InterviewType) => void;
}) {
  return (
    <button
      onClick={() => onClick(type)}
      className={`min-h-11 rounded-[28px] border p-5 text-left transition ${
        active
          ? 'border-coral bg-coral/15 shadow-glow'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-2xl text-white">{title}</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-mist/70">
          {type}
        </span>
      </div>
      <p className="text-sm leading-6 text-mist/75">{description}</p>
    </button>
  );
}
