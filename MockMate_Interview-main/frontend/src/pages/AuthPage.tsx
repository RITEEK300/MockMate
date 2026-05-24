import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthHero } from '../components/auth/AuthHero';
import { AppShell } from '../components/common/AppShell';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <AppShell compact>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <AuthHero />
        <section className="rounded-[32px] border border-white/10 bg-slate/70 p-6 shadow-glow sm:p-8">
          <div className="mb-6 flex rounded-full border border-white/10 bg-white/5 p-1">
            {(['signup', 'login'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={`min-h-11 flex-1 rounded-full px-4 text-sm font-semibold capitalize transition ${
                  mode === tab ? 'bg-white text-ink' : 'text-mist/75'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError(null);
              try {
                if (mode === 'signup') {
                  await signup({ name, email, password });
                } else {
                  await login({ email, password });
                }
                navigate('/dashboard');
              } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : 'Unable to continue');
              } finally {
                setBusy(false);
              }
            }}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Access MockMate</p>
              <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] text-white">
                {mode === 'signup' ? 'Create your practice lane.' : 'Welcome back.'}
              </h2>
            </div>
            {mode === 'signup' ? (
              <label className="grid gap-2 text-sm text-mist/80">
                Full name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-mist/35 focus:border-mint"
                  placeholder="Aarav Sharma"
                />
              </label>
            ) : null}
            <label className="grid gap-2 text-sm text-mist/80">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-mist/35 focus:border-mint"
                placeholder="you@example.com"
              />
            </label>
            <label className="grid gap-2 text-sm text-mist/80">
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                minLength={8}
                className="min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-mist/35 focus:border-mint"
                placeholder="Minimum 8 characters"
              />
            </label>
            {error ? <div className="rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Login'}
            </Button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
