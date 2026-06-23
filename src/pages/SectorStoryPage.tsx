import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSectorStory, colorFor, metricLabel } from '../hooks/useSectorStory';
import { useScrollStages } from '../hooks/useScrollStages';
import { withViewTransition } from '../lib/viewTransition';
import { Spinner, ErrorState, EmptyState } from '../components/States';
import './SectorStory.css';

// CP5 — Sector Story Engine.
// Scrollytelling: narrativa por etapas activadas por scroll + visual persistente
// que cambia con la etapa activa + progreso + scroll-driven animations con
// fallback + View Transition + teclado + reduced motion.
export function SectorStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const story = useSectorStory(id);

  const stages = story.status === 'success' && story.data ? story.data.stages : [];
  const { activeIndex, setPanelRef, goToStage } = useScrollStages(stages.length);

  // Barra de progreso por JS (fallback). Donde hay scroll-driven CSS, el CSS
  // la maneja; este valor extra no estorba.
  const [scrollPct, setScrollPct] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setScrollPct(max > 0 ? doc.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [stages.length]);

  // Teclado: flechas / Home / End mueven entre etapas.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stages.length === 0) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goToStage(activeIndex + 1); }
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goToStage(activeIndex - 1); }
      else if (e.key === 'Home') { e.preventDefault(); goToStage(0); }
      else if (e.key === 'End') { e.preventDefault(); goToStage(stages.length - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, stages.length, goToStage]);

  if (story.status === 'loading') return <div className="py-20"><Spinner label="Cargando historia" /></div>;
  if (story.status === 'error') return <div className="py-20"><ErrorState message={story.error} onRetry={story.refetch} /></div>;
  if (!story.data || stages.length === 0) return <div className="py-20"><EmptyState message="Este sector no tiene historia." /></div>;

  const active = stages[activeIndex];
  const activeColor = colorFor(active.colorToken);

  function back() {
    withViewTransition(() => navigate('/sectors'));
  }

  return (
    <div ref={rootRef} className="story-root" style={{ ['--story-color' as string]: activeColor }}>
      {/* Barra de progreso fija arriba */}
      <div className="fixed inset-x-0 top-14 z-20 h-1 bg-surface-overlay">
        <div className="story-progress-fill h-full"
             style={{ transform: `scaleX(${scrollPct})` }} />
      </div>

      {/* Encabezado con volver (View Transition) */}
      <div className="fixed left-4 top-16 z-20">
        <button onClick={back}
          className="rounded-md border border-surface-border bg-surface-base/80 px-3 py-1.5 font-mono text-xs text-ink-secondary backdrop-blur transition-colors hover:border-accent hover:text-accent">
          ← Sectores
        </button>
      </div>

      {/* Indicador de etapas (también navegable por click) */}
      <nav aria-label="Etapas de la historia" className="fixed right-4 top-1/2 z-20 -translate-y-1/2 space-y-2">
        {stages.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goToStage(i)}
            aria-label={`Ir a etapa ${i + 1}: ${s.title}`}
            aria-current={i === activeIndex}
            className="block h-2.5 w-2.5 rounded-full border transition-all"
            style={{
              borderColor: i === activeIndex ? activeColor : '#2d333b',
              background: i === activeIndex ? activeColor : 'transparent',
              transform: i === activeIndex ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </nav>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
        {/* Visual persistente (sticky): cambia con la etapa activa */}
        <div className="story-visual" style={{ viewTransitionName: id ? `sector-${id}` : undefined }}>
          <div className="relative flex items-center justify-center" aria-hidden="true">
            <div className="story-ring" style={{ width: 320, height: 320, transform: `scale(${1 + activeIndex * 0.04})` }} />
            <div className="story-ring" style={{ width: 260, height: 260 }} />
            <div className="story-orb" style={{ transform: `scale(${0.9 + (active.metrics.energy ?? 50) / 200})` }} />
            <div className="absolute text-center">
              <div className="font-mono text-3xl font-medium" style={{ color: activeColor }}>
                {active.order + 1}
              </div>
              <div className="font-mono text-xs text-ink-muted">/ {stages.length}</div>
            </div>
          </div>
        </div>

        {/* Columna de narrativa por etapas */}
        <div className="py-[40vh]">
          {stages.map((stage, i) => (
            <section
              key={stage.id}
              ref={setPanelRef(i)}
              data-stage-index={i}
              className={`story-panel mb-[50vh] ${i === activeIndex ? 'stage-active' : ''}`}>
              <p className="mb-2 font-mono text-xs" style={{ color: colorFor(stage.colorToken) }}>
                Etapa {stage.order + 1} · {stage.dominantEvent}
              </p>
              <h3 className="mb-3 font-mono text-xl text-ink-primary">{stage.title}</h3>
              <p className="mb-5 text-sm leading-relaxed text-ink-secondary">{stage.narrative}</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(stage.metrics).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-surface-border bg-surface-raised p-3">
                    <div className="font-mono text-lg font-medium" style={{ color: colorFor(stage.colorToken) }}>{v}</div>
                    <div className="font-mono text-[11px] text-ink-muted">{metricLabel(k)}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
