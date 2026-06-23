import { useState, useEffect, useRef, useCallback } from 'react';

// Detecta qué etapa está activa según el scroll usando IntersectionObserver.
// Cada panel de narrativa se registra; el que está más centrado en viewport
// es la etapa activa. El visual persistente reacciona a este índice.
export function useScrollStages(count: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);

  const setPanelRef = useCallback((index: number) => (el: HTMLElement | null) => {
    panelRefs.current[index] = el;
  }, []);

  useEffect(() => {
    const panels = panelRefs.current.filter(Boolean) as HTMLElement[];
    if (panels.length === 0) return;

    const visible = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.stageIndex);
          if (entry.isIntersecting) visible.set(idx, entry.intersectionRatio);
          else visible.delete(idx);
        }
        if (visible.size > 0) {
          // El panel con mayor proporción visible gana.
          let best = -1, bestRatio = -1;
          for (const [idx, ratio] of visible) {
            if (ratio > bestRatio) { bestRatio = ratio; best = idx; }
          }
          if (best >= 0) setActiveIndex(best);
        }
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -20% 0px' },
    );

    panels.forEach((p) => observer.observe(p));
    return () => observer.disconnect();
  }, [count]);

  // Navegación por teclado: flechas mueven entre etapas sin perder contenido.
  const goToStage = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(count - 1, index));
    const panel = panelRefs.current[clamped];
    if (panel) panel.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  }, [count]);

  return { activeIndex, setPanelRef, goToStage };
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
