import { useSignalDetail, useUpdateSignalStatus } from '../hooks/useSignalDetail';
import { Spinner, ErrorState } from './States';
import { SeverityBadge, StatusBadge } from './Badges';
import type { Signal, SignalStatus, SignalStatusUpdate } from '../types/api';

const UPDATABLE: SignalStatusUpdate[] = ['PROCESANDO', 'ATENDIDA'];

// Panel de detalle de Señal (CP4). Se abre desde el feed SIN perder posición
// (es un overlay, el feed no se desmonta). Al actualizar, notifica al feed.
export function SignalDetailPanel({
  signalId,
  onClose,
  onStatusChanged,
}: {
  signalId: string;
  onClose: () => void;
  onStatusChanged: (id: string, status: SignalStatus) => void;
}) {
  const detail = useSignalDetail(signalId);
  const { state: patch, update, reset } = useUpdateSignalStatus();

  async function handleUpdate(status: SignalStatusUpdate) {
    const updated = await update(signalId, status);
    if (updated) {
      onStatusChanged(updated.id, updated.status);   // refleja en el feed
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto border-l border-surface-border bg-surface-raised p-5"
        onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-sm text-ink-secondary">Detalle de señal</h3>
          <button onClick={onClose} className="font-mono text-xs text-ink-muted hover:text-ink-primary">✕ Cerrar</button>
        </div>

        {detail.status === 'loading' && <Spinner label="Cargando señal" />}
        {detail.status === 'error' && <ErrorState message={detail.error} onRetry={detail.refetch} />}
        {detail.status === 'success' && detail.data && (
          <SignalBody
            signal={detail.data}
            patchStatus={patch.status}
            patchError={patch.status === 'error' ? patch.message : null}
            onUpdate={handleUpdate}
            onDismissError={reset}
          />
        )}
      </aside>
    </div>
  );
}

function SignalBody({
  signal, patchStatus, patchError, onUpdate, onDismissError,
}: {
  signal: Signal;
  patchStatus: 'idle' | 'saving' | 'success' | 'error';
  patchError: string | null;
  onUpdate: (s: SignalStatusUpdate) => void;
  onDismissError: () => void;
}) {
  const saving = patchStatus === 'saving';
  return (
    <div className="space-y-4 font-mono">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge value={signal.severity} />
        <StatusBadge value={signal.status} />
        <span className="text-xs text-ink-muted">{signal.signalType}</span>
      </div>

      <dl className="space-y-2 text-sm">
        <Row label="ID" value={signal.id} />
        <Row label="Tropel" value={signal.tropelId} />
        <Row label="Creada" value={new Date(signal.createdAt).toLocaleString()} />
        <Row label="Actualizada" value={new Date(signal.updatedAt).toLocaleString()} />
      </dl>

      <div className="rounded-md border border-surface-border bg-surface-overlay p-3 text-sm text-ink-secondary">
        {signal.rawContent}
      </div>

      {patchStatus === 'success' && (
        <p className="rounded-md border border-sev-leve/30 bg-sev-leve/5 px-3 py-2 text-xs text-sev-leve">
          ✓ Estado actualizado a {signal.status}.
        </p>
      )}
      {patchError && (
        <div className="rounded-md border border-sev-critico/30 bg-sev-critico/5 px-3 py-2 text-xs text-sev-critico">
          {patchError}
          <button onClick={onDismissError} className="ml-2 underline hover:no-underline">descartar</button>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {UPDATABLE.map((s) => (
          <button
            key={s}
            disabled={saving || signal.status === s}
            onClick={() => onUpdate(s)}
            className="flex-1 rounded-md border border-surface-border px-3 py-2 text-xs text-ink-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-surface-border disabled:hover:text-ink-secondary">
            {saving ? 'Guardando…' : `Marcar ${s}`}
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="truncate text-ink-primary">{value}</dd>
    </div>
  );
}
