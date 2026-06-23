import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import type { Species, VitalState } from '../types/api';

// Estado de la consulta de Tropeles, derivado SIEMPRE de la URL.
// Esto cumple el requisito de CP2: "estado completo reflejado en la URL" y
// "restauración del mismo estado al recargar o compartir la URL".
// No hay useState duplicando esto: la URL es la única fuente de verdad.

export type SortOption = 'name,asc' | 'updatedAt,desc' | 'chaosIndex,desc';
export const SORT_OPTIONS: SortOption[] = ['name,asc', 'updatedAt,desc', 'chaosIndex,desc'];
export const SIZE_OPTIONS = [10, 20, 50] as const;
export type SizeOption = (typeof SIZE_OPTIONS)[number];

export interface TropelsQuery {
  page: number;
  size: SizeOption;
  species: Species | '';
  vitalState: VitalState | '';
  sectorId: string;
  q: string;
  sort: SortOption;
}

function parseSize(v: string | null): SizeOption {
  const n = Number(v);
  return (SIZE_OPTIONS as readonly number[]).includes(n) ? (n as SizeOption) : 10;
}
function parseSort(v: string | null): SortOption {
  return SORT_OPTIONS.includes(v as SortOption) ? (v as SortOption) : 'updatedAt,desc';
}

export function useTropelsQuery() {
  const [params, setParams] = useSearchParams();

  const query = useMemo<TropelsQuery>(() => ({
    page: Math.max(0, Number(params.get('page')) || 0),
    size: parseSize(params.get('size')),
    species: (params.get('species') as Species) ?? '',
    vitalState: (params.get('vitalState') as VitalState) ?? '',
    sectorId: params.get('sectorId') ?? '',
    q: params.get('q') ?? '',
    sort: parseSort(params.get('sort')),
  }), [params]);

  // Actualiza la URL. Cualquier cambio de filtro/sort/búsqueda resetea page a 0,
  // excepto cuando explícitamente cambiamos de página.
  const update = useCallback((patch: Partial<TropelsQuery>, resetPage = true) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value === '' || value === undefined || value === null) next.delete(key);
        else next.set(key, String(value));
      }
      if (resetPage && !('page' in patch)) next.set('page', '0');
      return next;
    }, { replace: false });
  }, [setParams]);

  const setPage = useCallback((page: number) => update({ page }, false), [update]);

  return { query, update, setPage };
}
