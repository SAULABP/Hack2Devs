import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../lib/apiClient';

// Prefill desde el .env para no tipear credenciales en cada test durante el evento.
const ENV = import.meta.env as Record<string, string | undefined>;

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  const [teamCode, setTeamCode] = useState(ENV.VITE_TEAM_CODE ?? '');
  const [email, setEmail] = useState(ENV.VITE_EMAIL ?? '');
  const [password, setPassword] = useState(ENV.VITE_PASSWORD ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') return <Navigate to={from} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(teamCode.trim(), email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Credenciales inválidas. Revisa team code, email y contraseña.');
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('No se pudo iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <h1 className="font-mono text-lg font-medium">TropelCare Control Room</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-surface-border bg-surface-raised p-6">
          <Field label="Team code" value={teamCode} onChange={setTeamCode} placeholder="TEAM-0XX" mono autoFocus />
          <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="operator@tuckersoft.com" />
          <Field label="Contraseña" value={password} onChange={setPassword} type="password" placeholder="••••••••" />

          {error && (
            <p className="rounded-md border border-sev-critico/30 bg-sev-critico/5 px-3 py-2 font-mono text-xs text-sev-critico" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting}
            className="w-full rounded-md bg-accent px-3 py-2 font-mono text-sm font-medium text-surface-base transition-opacity hover:opacity-90 disabled:opacity-50">
            {submitting ? 'Conectando…' : 'Encender consola'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; mono?: boolean; autoFocus?: boolean;
}
function Field({ label, value, onChange, type = 'text', placeholder, mono, autoFocus }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-xs text-ink-secondary">{label}</span>
      <input
        type={type} value={value} placeholder={placeholder} autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-md border border-surface-border bg-surface-overlay px-3 py-2 text-sm text-ink-primary outline-none transition-colors placeholder:text-ink-muted focus:border-accent ${mono ? 'font-mono' : ''}`}
      />
    </label>
  );
}
