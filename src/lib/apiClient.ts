import type { ApiErrorBody } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!BASE_URL) {
  // Falla temprano y claro si falta la variable: mejor que un 404 misterioso.
  console.warn('[apiClient] VITE_API_BASE_URL no está definida. Revisa tu .env');
}

const TOKEN_KEY = 'tropelcare.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Error tipado que llevamos por toda la app. Nunca exponemos `any`.
export class ApiError extends Error {
  status: number;
  code: string;
  body: ApiErrorBody | null;
  constructor(status: number, code: string, message: string, body: ApiErrorBody | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

// Hook de 401 global: AuthContext lo registra para forzar logout.
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;
export function setUnauthorizedHandler(fn: UnauthorizedHandler | null): void {
  onUnauthorized = fn;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  // query como objeto: el cliente arma el querystring y omite undefined/null/''
  query?: Record<string, string | number | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;   // clave para CP2/CP3: cancelar requests obsoletas
  auth?: boolean;         // por defecto true; login usa false
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL((BASE_URL ?? '') + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, signal, auth = true } = opts;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    // AbortError debe propagarse tal cual para que el caller lo distinga.
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor.', null);
  }

  if (res.status === 401 && auth) {
    onUnauthorized?.();
    throw new ApiError(401, 'UNAUTHORIZED', 'Sesión expirada. Inicia sesión de nuevo.', null);
  }

  if (!res.ok) {
    let parsed: ApiErrorBody | null = null;
    try { parsed = (await res.json()) as ApiErrorBody; } catch { /* sin cuerpo JSON */ }
    throw new ApiError(
      res.status,
      parsed?.error ?? 'HTTP_ERROR',
      parsed?.message ?? `Error ${res.status}`,
      parsed,
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Azúcar para B y C: api.get / api.patch ya autenticados.
export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'GET' }),
  patch: <T>(path: string, body: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'PATCH', body }),
  post: <T>(path: string, body: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body }),
};
