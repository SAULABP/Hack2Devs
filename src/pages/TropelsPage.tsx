import { useState, useEffect } from 'react';
import { useTropelsQuery, SORT_OPTIONS, SIZE_OPTIONS, type SortOption, type SizeOption } from '../hooks/useTropelsQuery';
import { usePagedTropels } from '../hooks/usePagedTropels';
import { useSectors } from '../hooks/useSectors';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { Spinner, ErrorState, EmptyState } from '../components/States';
import { VitalDot } from '../components/Badges';
import type { Species, VitalState } from '../types/api';

const SPECIES: Species[] = ['BLOBITO', 'CHISPA', 'GRUNON', 'DORMILON', 'GLITCHY'];
const VITAL: VitalState[] = ['ESTABLE', 'HAMBRIENTO', 'AGITADO', 'MUTANDO', 'CRITICO'];
const SORT_LABEL: Record<SortOption, string> = {
  'name,asc': 'Nombre ↑',
  'updatedAt,desc': 'Actualizado ↓',
  'chaosIndex,desc': 'Caos ↓',
};

export function TropelsPage() {
  const { query, update, setPage } = useTropelsQuery();
  const state = usePagedTropels(query);
  const sectors = useSectors();

  // input local de búsqueda (controlado), sincronizado con la URL al montar.
  const [qInput, setQInput] = useState(query.q);
  useEffect(() => { setQInput(query.q); }, [query.q]);
  const pushSearch = useDebouncedCallback((value: string) => update({ q: value }), 350);

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-base">Atlas de Tropeles</h2>
        {state.status === 'success' && (
          <span className="font-mono text-xs text-ink-muted">
            {state.data.totalElements} tropeles · página {state.data.currentPage + 1}/{Math.max(1, state.data.totalPages)}
          </span>
        )}
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={qInput}
          onChange={(e) => { setQInput(e.target.value); pushSearch(e.target.value); }}
          placeholder="Buscar…"
          className="min-w-[180px] flex-1 rounded-md border border-surface-border bg-surface-overlay px-3 py-1.5 font-mono text-sm outline-none placeholder:text-ink-muted focus:border-accent"
        />
        <Select value={query.species} onChange={(v) => update({ species: v as Species | '' })} placeholder="Especie" options={SPECIES} />
        <Select value={query.vitalState} onChange={(v) => update({ vitalState: v as VitalState | '' })} placeholder="Estado vital" options={VITAL} />
        <Select
          value={query.sectorId}
          onChange={(v) => update({ sectorId: v })}
          placeholder="Sector"
          options={sectors.status === 'success' ? sectors.data.map((s) => s.id) : []}
          labels={sectors.status === 'success' ? Object.fromEntries(sectors.data.map((s) => [s.id, s.name])) : {}}
        />
        <select
          value={query.sort}
          onChange={(e) => update({ sort: e.target.value as SortOption })}
          className="rounded-md border border-surface-border bg-surface-overlay px-2 py-1.5 font-mono text-sm outline-none focus:border-accent">
          {SORT_OPTIONS.map((s) => <option key={s} value={s}>{SORT_LABEL[s]}</option>)}
        </select>
        <select
          value={query.size}
          onChange={(e) => update({ size: Number(e.target.value) as SizeOption })}
          className="rounded-md border border-surface-border bg-surface-overlay px-2 py-1.5 font-mono text-sm outline-none focus:border-accent">
          {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}/pág</option>)}
        </select>
      </div>

      {/* Resultados: contenedor con alto mínimo para no mover el layout */}
      <div className="min-h-[400px]">
        {state.status === 'loading' && <Spinner label="Cargando tropeles" />}
        {state.status === 'error' && <ErrorState message={state.message} />}
        {state.status === 'success' && state.data.content.length === 0 && (
          <EmptyState message="Ningún Tropel coincide con estos filtros." />
        )}
        {state.status === 'success' && state.data.content.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-surface-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-overlay font-mono text-xs text-ink-secondary">
                <tr>
                  <Th>Nombre</Th><Th>Especie</Th><Th>Estado</Th><Th>Sector</Th>
                  <Th className="text-right">Energía</Th><Th className="text-right">Caos</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border font-mono">
                {state.data.content.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-surface-raised">
                    <td className="px-3 py-2 text-ink-primary">{t.name}</td>
                    <td className="px-3 py-2 text-ink-secondary">{t.species}</td>
                    <td className="px-3 py-2"><VitalDot value={t.vitalState} /></td>
                    <td className="px-3 py-2 text-ink-secondary">{t.sector.name}</td>
                    <td className="px-3 py-2 text-right text-ink-secondary">{t.energyLevel}</td>
                    <td className="px-3 py-2 text-right text-ink-secondary">{t.chaosIndex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {state.status === 'success' && state.data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <PageBtn disabled={query.page === 0} onClick={() => setPage(query.page - 1)}>← Anterior</PageBtn>
          <span className="font-mono text-xs text-ink-secondary">
            {state.data.currentPage + 1} / {state.data.totalPages}
          </span>
          <PageBtn disabled={query.page >= state.data.totalPages - 1} onClick={() => setPage(query.page + 1)}>Siguiente →</PageBtn>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 font-medium ${className}`}>{children}</th>;
}

function PageBtn({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="rounded-md border border-surface-border px-3 py-1.5 font-mono text-xs text-ink-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-surface-border disabled:hover:text-ink-secondary">
      {children}
    </button>
  );
}

interface SelectProps {
  value: string; onChange: (v: string) => void; placeholder: string;
  options: string[]; labels?: Record<string, string>;
}
function Select({ value, onChange, placeholder, options, labels }: SelectProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-surface-border bg-surface-overlay px-2 py-1.5 font-mono text-sm outline-none focus:border-accent">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
    </select>
  );
}
