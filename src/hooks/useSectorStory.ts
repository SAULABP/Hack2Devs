import { api } from '../lib/apiClient';
import { useApiResource } from './useApiResource';
import type { SectorStory, StoryStage } from '../types/api';

// Carga la historia de un sector (8 etapas ordenadas). Ordena por `order`
// defensivamente por si el backend no garantiza orden en el array.
export function useSectorStory(id: string | undefined) {
  return useApiResource<SectorStory | null>(async (signal) => {
    if (!id) return null;
    const story = await api.get<SectorStory>(`/sectors/${id}/story`, { signal });
    const stages = [...story.stages].sort((a, b) => a.order - b.order);
    return { ...story, stages };
  }, [id]);
}

// Mapea colorToken del backend a un color CSS concreto. Si llega un token
// desconocido, cae a un neutro. Esto mantiene el visual determinístico.
const COLOR_MAP: Record<string, string> = {
  emerald: '#2f9e8f',
  teal: '#1d9e75',
  cyan: '#2bb3c0',
  blue: '#378add',
  indigo: '#5d5fef',
  violet: '#7f77dd',
  purple: '#9a6dd7',
  pink: '#d4537e',
  rose: '#e24b6a',
  red: '#f85149',
  orange: '#db6d28',
  amber: '#d29922',
  lime: '#97c459',
  green: '#3fb950',
};

export function colorFor(token: string): string {
  return COLOR_MAP[token?.toLowerCase()] ?? '#6e7681';
}

// Etiqueta legible para una métrica (claves del JSONB del backend).
export function metricLabel(key: string): string {
  const map: Record<string, string> = {
    stability: 'Estabilidad',
    energy: 'Energía',
    alerts: 'Alertas',
    load: 'Carga',
    chaos: 'Caos',
  };
  return map[key] ?? key;
}

export type { StoryStage };
