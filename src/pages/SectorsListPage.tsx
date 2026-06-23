import { useNavigate } from 'react-router-dom';
import { useSectors } from '../hooks/useSectors';
import { withViewTransition } from '../lib/viewTransition';
import { Spinner, ErrorState, EmptyState } from '../components/States';

// Lista de sectores (CP5, vista resumen). Cada tarjeta navega a la historia
// con View Transition cuando hay soporte, fallback inmediato cuando no.
export function SectorsListPage() {
  const navigate = useNavigate();
  const sectors = useSectors();

  function openStory(id: string) {
    withViewTransition(() => navigate(`/sectors/${id}/story`));
  }

  if (sectors.status === 'loading') return <Spinner label="Cargando sectores" />;
  if (sectors.status === 'error') return <ErrorState message={sectors.error} onRetry={sectors.refetch} />;
  if (!sectors.data || sectors.data.length === 0) return <EmptyState message="No hay sectores." />;

  return (
    <div className="space-y-5">
      <h2 className="font-mono text-base">Sectores</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sectors.data.map((s) => {
          const loadPct = s.capacity > 0 ? Math.round((s.currentLoad / s.capacity) * 100) : 0;
          return (
            <button
              key={s.id}
              onClick={() => openStory(s.id)}
              style={{ viewTransitionName: `sector-${s.id}` }}
              className="rounded-xl border border-surface-border bg-surface-raised p-4 text-left transition-colors hover:border-accent/50">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-sm text-ink-primary">{s.name}</span>
                <span className="font-mono text-xs text-ink-muted">{s.sectorCode}</span>
              </div>
              <p className="mt-1 font-mono text-xs text-ink-muted">{s.climate}</p>
              <div className="mt-3 space-y-1.5">
                <Bar label="Estabilidad" value={s.stabilityLevel} />
                <Bar label="Carga" value={loadPct} />
              </div>
              <p className="mt-3 font-mono text-xs text-accent">Ver historia →</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 font-mono text-[11px] text-ink-muted">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-overlay">
        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="w-9 text-right font-mono text-[11px] text-ink-secondary">{value}%</span>
    </div>
  );
}
