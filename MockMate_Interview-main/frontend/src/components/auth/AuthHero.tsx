export function AuthHero() {
  return (
    <section className="grid gap-5 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur sm:p-8">
      <span className="w-fit rounded-full border border-mint/50 bg-mint/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-mint">
        Responsive mock interviews
      </span>
      <div className="space-y-4">
        <h1 className="font-display text-[clamp(2rem,6vw,4.8rem)] leading-[0.95] text-white">
          Practice real interviews with live humans, not canned scripts.
        </h1>
        <p className="max-w-2xl text-[clamp(1rem,2.5vw,1.25rem)] text-mist/80">
          Match instantly for HR or Technical rounds, jump into video, keep side-chat open,
          and leave with structured feedback you can actually use.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          'Mobile-first video layout',
          'WebRTC + chat + timer',
          'Redis matching + JWT auth'
        ].map((item) => (
          <div key={item} className="rounded-3xl border border-white/10 bg-slate/70 px-4 py-5 text-sm text-mist">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
