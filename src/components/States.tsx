// Estados de UI reutilizables. B y C los usan para loading/error/vacío
// sin que el layout salte (mismo alto mínimo).

interface MsgProps { label?: string; }

export function FullScreenLoader({ label = 'Cargando' }: MsgProps) {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-base">
      <Spinner label={label} />
    </div>
  );
}

export function Spinner({ label }: MsgProps) {
  return (
    <div className="flex items-center gap-3 text-ink-secondary" role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-muted border-t-accent" />
      <span className="font-mono text-sm">{label ?? 'Cargando'}…</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-[140px] flex-col items-start justify-center gap-3 rounded-lg border border-sev-critico/30 bg-sev-critico/5 p-4"
         role="alert">
      <p className="text-sm text-ink-primary">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="rounded-md border border-surface-border px-3 py-1.5 font-mono text-xs text-ink-secondary transition-colors hover:border-accent hover:text-accent">
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[140px] items-center justify-center rounded-lg border border-dashed border-surface-border p-4">
      <p className="font-mono text-sm text-ink-muted">{message}</p>
    </div>
  );
}
