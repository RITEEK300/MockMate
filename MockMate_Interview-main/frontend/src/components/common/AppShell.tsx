import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';

export function AppShell({
  children,
  compact = false
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  const { auth, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(61,217,184,0.22),_transparent_35%),linear-gradient(180deg,_#08121c_0%,_#102739_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 px-4 py-4 shadow-glow backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link to={auth ? '/dashboard' : '/'} className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sand text-lg font-black text-ink">MM</div>
            <div>
              <p className="font-display text-xl">MockMate</p>
              <p className="text-sm text-mist/70">Interview like it matters</p>
            </div>
          </Link>
          {auth ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm">
                <div className="text-mist/70">Signed in as</div>
                <div className="font-semibold text-white">{auth.name}</div>
              </div>
              {!compact && (
                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              )}
            </div>
          ) : null}
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
