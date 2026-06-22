import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tropels', label: 'Tropeles' },
  { to: '/signals', label: 'Señales' },
  { to: '/sectors', label: 'Sectores' },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface-base">
      <header className="sticky top-0 z-20 border-b border-surface-border bg-surface-base/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="font-mono text-sm font-medium tracking-tight">TropelCare</span>
            <span className="font-mono text-xs text-ink-muted">/ control room</span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 font-mono text-sm transition-colors ${
                    isActive ? 'bg-surface-overlay text-ink-primary' : 'text-ink-secondary hover:text-ink-primary'
                  }`
                }>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-xs text-ink-muted">
              {user?.teamCode} · {user?.displayName}
            </span>
            <button onClick={logout}
              className="rounded-md border border-surface-border px-2.5 py-1 font-mono text-xs text-ink-secondary transition-colors hover:border-sev-critico hover:text-sev-critico">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Aquí montan B (tropels/signals) y C (sectors/story) */}
        <Outlet />
      </main>
    </div>
  );
}
