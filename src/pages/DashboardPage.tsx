import { api } from '../lib/apiClient';
import { useApiResource } from '../hooks/useApiResource';
import { Spinner, ErrorState, EmptyState } from '../components/States';
import type { DashboardSummary, Severity } from '../types/api';

const SEV_ORDER: Severity[] = ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO'];
const SEV_BAR: Record<Severity, string> = {
  LEVE: 'bg-sev-leve', MODERADO: 'bg-sev-moderado', GRAVE: 'bg-sev-grave', CRITICO: 'bg-sev-critico',
};

export function DashboardPage() {
  const { status, data, error, refetch } = useApiResource<DashboardSummary>(
    (signal) => api.get<DashboardSummary>('/dashboard/summary', { signal }),
    [],
  );

  if (status === 'loading') return <Spinner label="Cargando indicadores" />;
  if (status === 'error') return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return <EmptyState message="Sin datos del dashboard." />;

  const maxSev = Math.max(...SEV_ORDER.map((s) => data.signalsBySeverity[s] ?? 0), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-base text-ink-primary">Estado del workspace</h2>
        <span className="font-mono text-xs text-ink-muted">
          actualizado {new Date(data.generatedAt).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Tropeles" value={data.totalTropels} />
        <Kpi label="Críticos" value={data.criticalTropels} tone="critico" />
        <Kpi label="Señales abiertas" value={data.openSignals} tone="grave" />
        <Kpi label="Estabilidad media" value={`${data.sectorStabilityAvg}%`} tone="leve" />
      </div>

      <div className="rounded-xl border border-surface-border bg-surface-raised p-5">
        <h3 className="mb-4 font-mono text-sm text-ink-secondary">Señales por severidad</h3>
        <div className="space-y-3">
          {SEV_ORDER.map((sev) => {
            const v = data.signalsBySeverity[sev] ?? 0;
            return (
              <div key={sev} className="flex items-center gap-3">
                <span className="w-20 font-mono text-xs text-ink-secondary">{sev}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-overlay">
                  <div className={`h-full rounded-full ${SEV_BAR[sev]}`} style={{ width: `${(v / maxSev) * 100}%` }} />
                </div>
                <span className="w-10 text-right font-mono text-xs text-ink-primary">{v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number | string; tone?: 'leve' | 'grave' | 'critico' }) {
  const color = tone === 'critico' ? 'text-sev-critico' : tone === 'grave' ? 'text-sev-grave' : tone === 'leve' ? 'text-sev-leve' : 'text-ink-primary';
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
      <div className={`font-mono text-2xl font-medium ${color}`}>{value}</div>
      <div className="mt-1 font-mono text-xs text-ink-muted">{label}</div>
    </div>
  );
}
