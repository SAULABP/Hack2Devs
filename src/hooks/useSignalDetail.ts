import { useState, useCallback } from 'react';
import { api, ApiError } from '../lib/apiClient';
import { useApiResource } from './useApiResource';
import type { Signal, SignalStatusUpdate } from '../types/api';

// Carga el detalle de una Señal (CP4) con loading/error.
export function useSignalDetail(id: string | null) {
  return useApiResource<Signal | null>(
    (signal) => id ? api.get<Signal>(`/signals/${id}`, { signal }) : Promise.resolve(null),
    [id],
  );
}

type PatchState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'success' }
  | { status: 'error'; message: string };

// Maneja el PATCH de estado con: deshabilitar mientras está en vuelo,
// confirmación al completar, y error accionable conservando el estado previo.
export function useUpdateSignalStatus() {
  const [state, setState] = useState<PatchState>({ status: 'idle' });

  const update = useCallback(async (id: string, status: SignalStatusUpdate): Promise<Signal | null> => {
    setState({ status: 'saving' });
    try {
      const updated = await api.patch<Signal>(`/signals/${id}/status`, { status });
      setState({ status: 'success' });
      return updated;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.';
      setState({ status: 'error', message });
      return null;   // el caller conserva el estado anterior
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);
  return { state, update, reset };
}
