import { useEffect, useRef } from 'react';

// Dispara onReachEnd cuando el elemento centinela entra en viewport.
// Esto es infinite scroll REAL (no un botón "Cargar más", que invalida la entrega).
export function useInfiniteScroll(onReachEnd: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const cbRef = useRef(onReachEnd);
  useEffect(() => { cbRef.current = onReachEnd; });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !enabled) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) cbRef.current(); },
      { rootMargin: '200px' },  // precarga un poco antes de tocar el fondo
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return sentinelRef;
}
