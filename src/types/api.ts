// Tipos del contrato de la API (congelado en OpenAPI).
// NADA de `any` para respuestas de API: la rúbrica lo prohíbe.

export type Species = 'BLOBITO' | 'CHISPA' | 'GRUNON' | 'DORMILON' | 'GLITCHY';
export type VitalState = 'ESTABLE' | 'HAMBRIENTO' | 'AGITADO' | 'MUTANDO' | 'CRITICO';
export type SignalType =
  | 'HAMBRE' | 'ABANDONO' | 'MUTACION' | 'FUGA'
  | 'CONFLICTO' | 'REPRODUCCION_MASIVA' | 'SENAL_CORRUPTA';
export type Severity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO';
export type SignalStatus = 'RECIBIDA' | 'PROCESANDO' | 'ATENDIDA';

// El enunciado frontend solo permite mutar a PROCESANDO | ATENDIDA
export type SignalStatusUpdate = 'PROCESANDO' | 'ATENDIDA';

export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  teamCode: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface DashboardSummary {
  totalTropels: number;
  criticalTropels: number;
  openSignals: number;
  sectorStabilityAvg: number;
  signalsBySeverity: Record<Severity, number>;
  generatedAt: string;
}

export interface SectorRef {
  id: string;
  name: string;
  sectorCode: string;
}

export interface Tropel {
  id: string;
  name: string;
  species: Species;
  vitalState: VitalState;
  energyLevel: number;
  chaosIndex: number;
  mutationStage: number;
  guardianName: string;
  sector: SectorRef;
  createdAt: string;
  updatedAt: string;
}

// Paginación clásica de /tropels
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface Signal {
  id: string;
  tropelId: string;
  signalType: SignalType;
  severity: Severity;
  status: SignalStatus;
  rawContent: string;
  createdAt: string;
  updatedAt: string;
}

// Feed cursor-based de /signals/feed
export interface SignalFeedPage {
  items: Signal[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

export interface Sector {
  id: string;
  sectorCode: string;
  name: string;
  climate: string;
  capacity: number;
  currentLoad: number;
  stabilityLevel: number;
  updatedAt: string;
}

export interface StoryStage {
  id: string;
  stageOrder: number;
  title: string;
  narrative: string;
  dominantEvent: string;
  metrics: Record<string, number>;
  assetKey: string;
  colorToken: string;
  progress: number;
}

export interface SectorStory {
  sector: SectorRef;
  stages: StoryStage[];
}

// Formato único de error del backend
export interface ApiErrorBody {
  error: string;
  message: string;
  timestamp: string;
  path: string;
  details?: Record<string, unknown>;
}
