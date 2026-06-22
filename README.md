# TropelCare Control Room

Consola operativa en React + TypeScript para gestionar Tropeles y Señales.
Hackathon frontend — Pizza Protocol.

## Integrantes

| Nombre |  Rol |
|--------|-----|
| saul baltazar |  A — auth, layout, dashboard, deploy |
| Ralfh Sanders|  B — Tropeles (CP2) + Feed (CP3/CP4) |
| Ariel Choque| C — Sector Story Engine (CP5) |

## Stack

React 18 · TypeScript estricto · Vite · React Router · Tailwind CSS · Fetch API.

## Instalación

```bash
npm install
cp .env.example .env   # rellenar con las credenciales del TA
npm run dev
```

## Comandos

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (debe pasar sin errores) |
| `npm run typecheck` | `tsc --noEmit` (debe pasar sin errores) |
| `npm run preview` | Previsualizar el build |

## Variables de entorno

```
VITE_API_BASE_URL=https://<backend-url>/api/v1
VITE_TEAM_CODE=TEAM-0XX        # opcional: prefill del login
VITE_EMAIL=operator@...        # opcional: prefill del login
VITE_PASSWORD=...              # opcional: prefill del login
```

Solo `VITE_API_BASE_URL` es obligatoria. Las demás precargan el formulario de login.

## Deploy

Link: _(pegar aquí)_

El deploy incluye SPA rewrites (`vercel.json` / `public/_redirects`) para que abra
directamente en cualquier ruta, incluyendo `/sectors/:id/story`.

## Arquitectura y decisiones técnicas

- **`src/lib/apiClient.ts`** — cliente HTTP único. Inyecta el JWT, normaliza errores
  en una clase `ApiError` tipada (sin `any`), soporta `AbortSignal` para cancelar
  requests obsoletas (clave en CP2/CP3) y dispara un handler global ante un `401`.
- **`src/auth/`** — `AuthContext` expone `useAuth()` con `login`, `logout`, `user` y
  `status`. Restaura la sesión al recargar validando el token contra `/auth/me`.
  `ProtectedRoute` no redirige mientras la sesión está en estado `loading`, evitando
  el parpadeo a `/login` al recargar una ruta privada.
- **`src/components/AppLayout.tsx`** — shell compartido con navegación; las rutas de
  cada integrante se montan como hijas vía `<Outlet />`.
- **`src/components/States.tsx`** — loading / error / vacío reutilizables con alto
  mínimo fijo para no mover el layout.
- **Tipos** — `src/types/api.ts` modela el contrato congelado. Ningún `any` para
  respuestas de API.

### Contrato para B y C

```ts
import { api } from './lib/apiClient';
import { useAuth } from './auth/AuthContext';

const page = await api.get<Page<Tropel>>('/tropels', { query, signal });
const updated = await api.patch<Signal>(`/signals/${id}/status`, { status: 'ATENDIDA' });
```

Todo llega ya autenticado. No hay que tocar headers ni tokens.
