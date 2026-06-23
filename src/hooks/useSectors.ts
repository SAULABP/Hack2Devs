import { api } from '../lib/apiClient';
import { useApiResource } from './useApiResource';
import type { Sector } from '../types/api';

// El contrato real devuelve { items: [...] }; algunos entornos devuelven el array
// directo. Normalizamos a Sector[] para que tanto B (filtro) como C (lista) lo usen.
interface SectorsResponse { items: Sector[] }

function isWrapped(v: unknown): v is SectorsResponse {
  return typeof v === 'object' && v !== null && Array.isArray((v as SectorsResponse).items);
}

export function useSectors() {
  return useApiResource<Sector[]>(async (signal) => {
    const res = await api.get<Sector[] | SectorsResponse>('/sectors', { signal });
    return isWrapped(res) ? res.items : res;
  }, []);
}
