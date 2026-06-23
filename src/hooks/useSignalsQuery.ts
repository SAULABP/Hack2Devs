import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import type { SignalType, Severity, SignalStatus } from '../types/api';

// Filtros del feed, persistidos en URL (requisito de CP3).
export interface SignalsQuery {
  signalType: SignalType | '';
  severity: Severity | '';
  status: SignalStatus | '';
  q: string;
}

export function useSignalsQuery() {
  const [params, setParams] = useSearchParams();

  const query = useMemo<SignalsQuery>(() => ({
    signalType: (params.get('signalType') as SignalType) ?? '',
    severity: (params.get('severity') as Severity) ?? '',
    status: (params.get('status') as SignalStatus) ?? '',
    q: params.get('q') ?? '',
  }), [params]);

  const update = useCallback((patch: Partial<SignalsQuery>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(patch)) {
        if (v === '' || v == null) next.delete(k); else next.set(k, String(v));
      }
      return next;
    });
  }, [setParams]);

  // Clave estable que identifica el conjunto de filtros: cuando cambia,
  // el feed se reinicia desde cero (nuevo cursor).
  const key = `${query.signalType}|${query.severity}|${query.status}|${query.q}`;

  return { query, update, key };
}
