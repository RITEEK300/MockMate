import { useState } from 'react';

import { Button } from '../common/Button';
import type { FeedbackPayload } from '../../types';

export function FeedbackForm({
  roomId,
  targetUserId,
  onSubmit
}: {
  roomId: string;
  targetUserId: string;
  onSubmit: (payload: FeedbackPayload) => Promise<void>;
}) {
  const [rating, setRating] = useState(4);
  const [summary, setSummary] = useState('');
  const [highlights, setHighlights] = useState(['', '']);
  const [improvements, setImprovements] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-5 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow"
      onSubmit={async (event) => {
        event.preventDefault();
        const cleanHighlights = highlights.map((item) => item.trim()).filter(Boolean);
        const cleanImprovements = improvements.map((item) => item.trim()).filter(Boolean);
        if (cleanHighlights.length === 0 || cleanImprovements.length === 0) {
          setError('At least ek highlight aur ek improvement dena zaroori hai.');
          return;
        }
        setSubmitting(true);
        setError(null);
        try {
          await onSubmit({
            roomId,
            targetUserId,
            rating,
            summary,
            highlights: cleanHighlights,
            improvements: cleanImprovements
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Feedback</p>
        <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] text-white">Leave the kind of review you’d want to receive.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-mist/80">
          Rating
          <input
            type="range"
            min={1}
            max={5}
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
          />
          <span className="rounded-full bg-mint/15 px-3 py-2 text-center text-white">{rating}/5</span>
        </label>
        <label className="grid gap-2 text-sm text-mist/80">
          Summary
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            required
            className="min-h-28 rounded-3xl border border-white/10 bg-slate/60 px-4 py-3 text-white outline-none placeholder:text-mist/35 focus:border-mint"
            placeholder="What stood out in the mock interview?"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-3">
          <h3 className="font-semibold text-white">Highlights</h3>
          {highlights.map((value, index) => (
            <input
              key={`highlight-${index}`}
              value={value}
              onChange={(event) => {
                const next = [...highlights];
                next[index] = event.target.value;
                setHighlights(next);
              }}
              placeholder={`Highlight ${index + 1}`}
              className="min-h-11 rounded-2xl border border-white/10 bg-slate/60 px-4 text-white outline-none placeholder:text-mist/35 focus:border-mint"
            />
          ))}
        </div>
        <div className="grid gap-3">
          <h3 className="font-semibold text-white">Improvements</h3>
          {improvements.map((value, index) => (
            <input
              key={`improvement-${index}`}
              value={value}
              onChange={(event) => {
                const next = [...improvements];
                next[index] = event.target.value;
                setImprovements(next);
              }}
              placeholder={`Improvement ${index + 1}`}
              className="min-h-11 rounded-2xl border border-white/10 bg-slate/60 px-4 text-white outline-none placeholder:text-mist/35 focus:border-mint"
            />
          ))}
        </div>
      </div>
      {error ? <div className="rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit feedback'}
      </Button>
    </form>
  );
}
