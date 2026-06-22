import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../lib/apiClient';

type State<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string };

// Hook genérico para GET con loading/error/refetch + cancelación.
// Útil para CP1 (dashboard) y como base reutilizable.
export function useApiResource<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<State<T>>({ status: 'loading', data: null, error: null });

  const run = useCallback(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading', data: null, error: null });
    fetcher(ctrl.signal)
      .then((data) => setState({ status: 'success', data, error: null }))
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg = err instanceof ApiError ? err.message : 'Error inesperado.';
        setState({ status: 'error', data: null, error: msg });
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);
  return { ...state, refetch: run };
}
