// Placeholders de las rutas de B y C. Reemplazar por la implementación real.
// Existen para que el router compile y el deploy abra en cualquier ruta desde el día 1.

function Stub({ owner, checkpoint, title }: { owner: string; checkpoint: string; title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-surface-border p-8">
      <p className="font-mono text-xs text-ink-muted">{checkpoint} · {owner}</p>
      <h2 className="mt-1 font-mono text-base text-ink-primary">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-ink-secondary">
        Ruta lista. Usa <code className="text-accent">api.get()</code> y <code className="text-accent">useAuth()</code> ya disponibles.
      </p>
    </div>
  );
}

export const TropelsPage = () => <Stub owner="Integrante B" checkpoint="CP2" title="Atlas de Tropeles" />;
export const SignalsPage = () => <Stub owner="Integrante B" checkpoint="CP3 / CP4" title="Feed de Señales" />;
export const SectorsPage = () => <Stub owner="Integrante C" checkpoint="CP5" title="Sectores" />;
export const SectorStoryPage = () => <Stub owner="Integrante C" checkpoint="CP5" title="Sector Story Engine" />;
