import type { InterviewRole } from '../../types';

export function QuestionPanel({
  questions,
  role
}: {
  questions: string[];
  role: InterviewRole;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Question panel</p>
          <h3 className="font-display text-2xl text-white">{role === 'INTERVIEWER' ? 'Guide the flow' : 'Answer with structure'}</h3>
        </div>
      </div>
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div key={question} className="rounded-3xl border border-white/10 bg-slate/70 px-4 py-4">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-mist/50">Prompt {index + 1}</p>
            <p className="text-sm leading-6 text-white/85">{question}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
