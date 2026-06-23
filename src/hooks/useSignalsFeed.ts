import { useState, useEffect, useRef, useCallback } from 'react';
import { api, ApiError } from '../lib/apiClient';
import type { Signal, SignalFeedPage, SignalStatus } from '../types/api';
import type { SignalsQuery } from './useSignalsQuery';

interface FeedState {
  items: Signal[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
  loadingInitial: boolean;
  loadingMore: boolean;
  error: string | null;   // error de "cargar más": NO borra páginas ya cargadas
}

const EMPTY: FeedState = {
  items: [], nextCursor: null, hasMore: true,
  totalEstimate: 0, loadingInitial: true, loadingMore: false, error: null,
};

// Feed cursor-based con todas las protecciones que pide CP3:
//  - dedup por ID (un Set acumulado)
//  - una sola carga adicional en vuelo (ref inFlight)
//  - cancelación de requests obsoletas al cambiar filtros (epoch + abort)
//  - recuperación de error sin borrar lo ya cargado
//  - fin de lista correcto (hasMore)
export function useSignalsFeed(query: SignalsQuery, queryKey: string) {
  const [state, setState] = useState<FeedState>(EMPTY);

  // epoch incrementa cada vez que cambian los filtros: descarta respuestas viejas.
  const epoch = useRef(0);
  const inFlight = useRef(false);
  const seenIds = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback((cursor: string | null, isInitial: boolean) => {
    if (inFlight.current) return;            // ← una sola carga en vuelo
    inFlight.current = true;
    const myEpoch = epoch.current;
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setState((s) => isInitial
      ? { ...EMPTY, loadingInitial: true }
      : { ...s, loadingMore: true, error: null });

    api.get<SignalFeedPage>('/signals/feed', {
      signal: ctrl.signal,
      query: {
        cursor: cursor || undefined,
        limit: 15,
        signalType: query.signalType || undefined,
        severity: query.severity || undefined,
        status: query.status || undefined,
        q: query.q || undefined,
      },
    })
      .then((res) => {
        if (myEpoch !== epoch.current) return;          // filtros cambiaron: descartar
        setState((s) => {
          const merged = isInitial ? [] : [...s.items];
          if (isInitial) seenIds.current = new Set();
          for (const item of res.items) {
            if (!seenIds.current.has(item.id)) {        // ← dedup por ID
              seenIds.current.add(item.id);
              merged.push(item);
            }
          }
          return {
            items: merged,
            nextCursor: res.nextCursor,
            hasMore: res.hasMore,
            totalEstimate: res.totalEstimate,
            loadingInitial: false,
            loadingMore: false,
            error: null,
          };
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (myEpoch !== epoch.current) return;
        const message = err instanceof ApiError ? err.message : 'Error al cargar el feed.';
        // Error NO borra páginas: solo marca el error para reintentar.
        setState((s) => ({ ...s, loadingInitial: false, loadingMore: false, error: message }));
      })
      .finally(() => { inFlight.current = false; });
  }, [query.signalType, query.severity, query.status, query.q]);

  // Reinicio total cuando cambian los filtros.
  useEffect(() => {
    epoch.current += 1;
    abortRef.current?.abort();
    seenIds.current = new Set();
    fetchPage(null, true);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const loadMore = useCallback(() => {
    setState((s) => {
      if (s.hasMore && !s.loadingMore && !s.loadingInitial && !inFlight.current) {
        fetchPage(s.nextCursor, false);
      }
      return s;
    });
  }, [fetchPage]);

  const retry = useCallback(() => {
    setState((s) => { fetchPage(s.nextCursor, s.items.length === 0); return s; });
  }, [fetchPage]);

  // Permite a CP4 reflejar un cambio de estado sin recargar el feed.
  const patchItem = useCallback((id: string, status: SignalStatus) => {
    setState((s) => ({ ...s, items: s.items.map((it) => it.id === id ? { ...it, status } : it) }));
  }, []);

  return { ...state, loadMore, retry, patchItem };
}
