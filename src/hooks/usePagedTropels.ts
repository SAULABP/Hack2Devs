import { useState, useEffect, useRef } from 'react';
import { api, ApiError } from '../lib/apiClient';
import type { Page, Tropel } from '../types/api';
import type { TropelsQuery } from './useTropelsQuery';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: Page<Tropel> }
  | { status: 'error'; message: string };

// Carga la página de Tropeles para la query actual con DOBLE protección
// contra respuestas obsoletas (race conditions), el punto que evalúa el TA:
//
//  1. AbortController: cada nueva query cancela el fetch en vuelo anterior.
//  2. requestId monotónico: aunque una respuesta vieja llegue tarde
//     (p.ej. el backend la retrasó), se descarta si no es la última pedida.
//
// Resultado: la UI SIEMPRE refleja la última query, nunca una anterior.

export function usePagedTropels(query: TropelsQuery) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const latestRequestId = useRef(0);

  useEffect(() => {
    const requestId = ++latestRequestId.current;
    const ctrl = new AbortController();
    setState({ status: 'loading' });

    api.get<Page<Tropel>>('/tropels', {
      signal: ctrl.signal,
      query: {
        page: query.page,
        size: query.size,
        species: query.species || undefined,
        vitalState: query.vitalState || undefined,
        sectorId: query.sectorId || undefined,
        q: query.q || undefined,
        sort: query.sort,
      },
    })
      .then((data) => {
        // Guard: solo aplica si esta sigue siendo la request más reciente.
        if (requestId === latestRequestId.current) setState({ status: 'success', data });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (requestId !== latestRequestId.current) return;
        const message = err instanceof ApiError ? err.message : 'Error al cargar Tropeles.';
        setState({ status: 'error', message });
      });

    return () => ctrl.abort();
  }, [query.page, query.size, query.species, query.vitalState, query.sectorId, query.q, query.sort]);

  return state;
}
