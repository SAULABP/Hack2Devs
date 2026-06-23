import { useState } from 'react';
import { useSignalsQuery } from '../hooks/useSignalsQuery';
import { useSignalsFeed } from '../hooks/useSignalsFeed';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { Spinner, ErrorState, EmptyState } from '../components/States';
import { SeverityBadge, StatusBadge } from '../components/Badges';
import { SignalDetailPanel } from '../components/SignalDetailPanel';
import type { SignalType, Severity, SignalStatus } from '../types/api';

const TYPES: SignalType[] = ['HAMBRE', 'ABANDONO', 'MUTACION', 'FUGA', 'CONFLICTO', 'REPRODUCCION_MASIVA', 'SENAL_CORRUPTA'];
const SEVS: Severity[] = ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO'];
const STATUSES: SignalStatus[] = ['RECIBIDA', 'PROCESANDO', 'ATENDIDA'];

export function SignalsPage() {
  const { query, update, key } = useSignalsQuery();
  const feed = useSignalsFeed(query, key);
  const [openId, setOpenId] = useState<string | null>(null);

  // Centinela: carga la siguiente página al acercarse al fondo.
  const sentinelRef = useInfiniteScroll(feed.loadMore, feed.hasMore && !feed.error);

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-base">Feed de señales</h2>
        <span className="font-mono text-xs text-ink-muted">
          {feed.items.length} cargadas{feed.totalEstimate ? ` · ~${feed.totalEstimate}` : ''}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect value={query.signalType} onChange={(v) => update({ signalType: v as SignalType | '' })} placeholder="Tipo" options={TYPES} />
        <FilterSelect value={query.severity} onChange={(v) => update({ severity: v as Severity | '' })} placeholder="Severidad" options={SEVS} />
        <FilterSelect value={query.status} onChange={(v) => update({ status: v as SignalStatus | '' })} placeholder="Estado" options={STATUSES} />
      </div>

      <div className="min-h-[400px] space-y-2">
        {feed.loadingInitial && <Spinner label="Cargando feed" />}
        {!feed.loadingInitial && feed.items.length === 0 && !feed.error && (
          <EmptyState message="No hay señales para estos filtros." />
        )}

        {feed.items.map((s) => (
          <button
            key={s.id}
            onClick={() => setOpenId(s.id)}
            className="flex w-full items-center gap-3 rounded-lg border border-surface-border bg-surface-raised px-4 py-3 text-left transition-colors hover:border-accent/50">
            <SeverityBadge value={s.severity} />
            <span className="font-mono text-sm text-ink-primary">{s.signalType}</span>
            <span className="flex-1 truncate font-mono text-xs text-ink-secondary">{s.rawContent}</span>
            <StatusBadge value={s.status} />
          </button>
        ))}

        {/* Estados al cargar más, sin borrar lo ya cargado */}
        {feed.loadingMore && <div className="py-3"><Spinner label="Cargando más" /></div>}
        {feed.error && !feed.loadingInitial && (
          <ErrorState message={feed.error} onRetry={feed.retry} />
        )}
        {!feed.hasMore && feed.items.length > 0 && (
          <p className="py-4 text-center font-mono text-xs text-ink-muted">— Fin del feed —</p>
        )}

        {/* Centinela invisible para el IntersectionObserver */}
        <div ref={sentinelRef} className="h-1" />
      </div>

      {openId && (
        <SignalDetailPanel
          signalId={openId}
          onClose={() => setOpenId(null)}
          onStatusChanged={feed.patchItem}
        />
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, placeholder, options }: {
  value: string; onChange: (v: string) => void; placeholder: string; options: string[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-surface-border bg-surface-overlay px-2 py-1.5 font-mono text-sm outline-none focus:border-accent">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
