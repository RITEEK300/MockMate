export function StatusBanner({
  title,
  message,
  tone = 'info'
}: {
  title: string;
  message: string;
  tone?: 'info' | 'warning';
}) {
  return (
    <div
      className={`rounded-3xl border px-4 py-4 text-sm ${
        tone === 'warning'
          ? 'border-yellow-300/35 bg-yellow-400/10 text-yellow-100'
          : 'border-mint/35 bg-mint/10 text-mist'
      }`}
    >
      <div className="mb-1 font-semibold">{title}</div>
      <div className="leading-6 opacity-90">{message}</div>
    </div>
  );
}
