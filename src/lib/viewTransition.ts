// Wrapper de la View Transition API con fallback funcional cuando no hay soporte.
// Si el navegador no soporta startViewTransition, ejecuta el cambio directamente.
type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

export function withViewTransition(update: () => void): void {
  const doc = document as DocWithVT;
  if (typeof doc.startViewTransition === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    doc.startViewTransition(update);
  } else {
    update(); // fallback: cambio inmediato, sin animación
  }
}
