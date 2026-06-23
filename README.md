# TropelCare Control Room

Consola operativa en React + TypeScript para gestionar Tropeles y Señales.
Hackathon frontend — Pizza Protocol.

## Integrantes

| Nombre | Rol |
|--------|-----|
| Saúl Baltazar | A — auth, layout, dashboard, deploy |
| Ralfh Sanders | B — Tropeles (CP2) + Feed (CP3) + Atender señal (CP4) |
| Ariel Choque | C — Sector Story Engine (CP5) |

## Stack

React 18 · TypeScript estricto · Vite · React Router · Tailwind CSS · Fetch API.

Sin librerías de cache de servidor (React Query, SWR, etc.) ni dashboards
prefabricados: paginación, infinite scroll y estado en URL están implementados a mano.

## Instalación

```bash
npm install
cp .env.example .env   # rellenar con las credenciales del equipo
npm run dev
```

App en `http://localhost:5173`.

## Comandos

| Comando | funmcion|
|---------|----------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (pasa sin errores) |
| `npm run typecheck` | `tsc --noEmit` (pasa sin errores) |
| `npm run preview` | Previsualizar el build |

## Variables de entorno

```
VITE_API_BASE_URL=https://hackaton-20261-front-587720740455.us-east1.run.app/api/v1
VITE_TEAM_CODE=‹TEAM-042›       
VITE_EMAIL=operator@tuckersoft.com   
VITE_PASSWORD=‹Pizza-TEAM-042›  
```

Solo `VITE_API_BASE_URL` es obligatoria. Las demás precargan el formulario de login.
El password sigue el formato `Pizza-<TEAM_CODE>`.

## Deploy

Link: ‹pegar URL de Vercel aquí›

El deploy incluye SPA rewrites (`vercel.json` y `public/_redirects`) para que abra
directamente en cualquier ruta, incluyendo `/sectors/:id/story`. Verificado: abrir
una ruta interna y recargar (F5) carga la app y redirige a login si no hay sesión,
nunca un 404.

## Checkpoints

| CP | Vista | Ruta |
|----|-------|------|
| 1 | Login, sesión y dashboard | `/login`, `/dashboard` |
| 2 | Atlas de Tropeles | `/tropels` |
| 3 | Feed infinito de señales | `/signals` |
| 4 | Atender una señal (panel) | dentro de `/signals` |
| 5 | Sector Story Engine | `/sectors`, `/sectors/:id/story` |

## Arquitectura y decisiones técnicas

### Núcleo compartido (saul)

- **`src/lib/apiClient.ts`** — cliente HTTP único. Inyecta el JWT, normaliza errores
  en una clase `ApiError` tipada (sin `any`), soporta `AbortSignal` para cancelar
  requests obsoletas y dispara un handler global ante un `401` (logout forzado).
- **`src/auth/`** — `AuthContext` expone `useAuth()` con `login`, `logout`, `user` y
  `status`. Restaura la sesión al recargar validando el token contra `/auth/me`.
  `ProtectedRoute` no redirige mientras la sesión está en `loading`, evitando el
  parpadeo a `/login` al recargar una ruta privada.
- **`src/components/AppLayout.tsx`** — shell compartido con navegación; las vistas de
  cada integrante se montan como rutas hijas vía `<Outlet />`.
- **`src/components/States.tsx`** — loading / error / vacío reutilizables con alto
  mínimo fijo para no mover el layout.
- **`src/types/api.ts`** — modela el contrato. Ningún `any` para respuestas de API.

### CP2 — Atlas de Tropeles (ralfh)

- **Estado en URL.** `useTropelsQuery` deriva filtros, orden, página y búsqueda
  directamente de la URL (única fuente de verdad). Copiar y abrir la URL en otra
  pestaña restaura el estado exacto. Cambiar un filtro resetea la página a 0.
- **Protección contra respuestas tardías.** `usePagedTropels` usa doble defensa:
  un `AbortController` que cancela el fetch anterior y un `requestId` monotónico que
  descarta cualquier respuesta que llegue tarde sin ser la última pedida. La UI nunca
  muestra resultados de una query anterior.
- Búsqueda con debounce (`useDebouncedCallback`) para no disparar una request por tecla.

### CP3 — Feed infinito (ralfh - saul)

- **Infinite scroll real** con `IntersectionObserver` (`useInfiniteScroll`); no hay
  botón "cargar más".
- **`useSignalsFeed`** maneja el cursor opaco con: deduplicación por ID (un `Set`
  acumulado), una sola carga en vuelo (`inFlight` ref), descarte de respuestas
  obsoletas al cambiar filtros (`epoch` ref + abort), recuperación de error sin
  borrar páginas ya cargadas, y fin de lista correcto (`hasMore`).
- Filtros del feed persistidos en URL (`useSignalsQuery`).

### CP4 — Atender una señal (ralfh)

- **`SignalDetailPanel`** se abre como overlay sobre el feed: el feed no se desmonta,
  así que no se pierde la posición de scroll.
- El PATCH (`useUpdateSignalStatus`) deshabilita la acción mientras está en vuelo,
  muestra confirmación al completar, y ante un error lo presenta de forma accionable
  conservando el estado anterior.
- Al actualizar, `patchItem` refleja el nuevo estado en el feed sin recargar.

### CP5 — Sector Story Engine (ariel)

- **Scrollytelling** con narrativa por etapas activadas por scroll
  (`useScrollStages` + `IntersectionObserver`) y un visual persistente (orbe sticky)
  que cambia de color, escala y métricas según la etapa activa.
- **CSS scroll-driven animations** (`animation-timeline: scroll()/view()`) cuando hay
  soporte, con fallback por JS (clase `.stage-active`) cuando no lo hay, detectado con
  `@supports`.
- **View Transition API** al navegar entre la lista y la historia, con fallback
  inmediato cuando el navegador no la soporta (`src/lib/viewTransition.ts`).
- **Navegación por teclado** (flechas, PageUp/Down, Home, End) y **barra de progreso**
  del recorrido.
- **`prefers-reduced-motion`** anula todas las animaciones y transiciones,
  conservando contenido y navegación. Comportamiento equivalente en desktop y mobile.

## Validación

```bash
npm run typecheck   # sin errores
npm run build       # sin errores
```

Ningún `any` para respuestas de API. Sin datos hardcodeados ni paginación simulada en
cliente: toda la data llega del backend.
