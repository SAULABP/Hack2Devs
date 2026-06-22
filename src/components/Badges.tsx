import type { Severity, SignalStatus, VitalState } from '../types/api';

const SEV_CLASS: Record<Severity, string> = {
  LEVE: 'text-sev-leve border-sev-leve/40 bg-sev-leve/10',
  MODERADO: 'text-sev-moderado border-sev-moderado/40 bg-sev-moderado/10',
  GRAVE: 'text-sev-grave border-sev-grave/40 bg-sev-grave/10',
  CRITICO: 'text-sev-critico border-sev-critico/40 bg-sev-critico/10',
};

export function SeverityBadge({ value }: { value: Severity }) {
  return <span className={`rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium ${SEV_CLASS[value]}`}>{value}</span>;
}

const STATUS_CLASS: Record<SignalStatus, string> = {
  RECIBIDA: 'text-ink-secondary border-surface-border bg-surface-overlay',
  PROCESANDO: 'text-sev-moderado border-sev-moderado/40 bg-sev-moderado/10',
  ATENDIDA: 'text-sev-leve border-sev-leve/40 bg-sev-leve/10',
};

export function StatusBadge({ value }: { value: SignalStatus }) {
  return <span className={`rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium ${STATUS_CLASS[value]}`}>{value}</span>;
}

const VITAL_CLASS: Record<VitalState, string> = {
  ESTABLE: 'text-sev-leve',
  HAMBRIENTO: 'text-sev-moderado',
  AGITADO: 'text-sev-grave',
  MUTANDO: 'text-sev-grave',
  CRITICO: 'text-sev-critico',
};

export function VitalDot({ value }: { value: VitalState }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${VITAL_CLASS[value]}`} />
      <span className="text-ink-secondary">{value}</span>
    </span>
  );
}
