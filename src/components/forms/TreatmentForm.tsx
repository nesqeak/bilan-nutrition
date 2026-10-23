import { Pill } from 'lucide-react';
import type { ReactNode } from 'react';
import { COMORBIDITY_LABELS, TREATMENT_PHASE_LABELS, isActiveTreatment } from '../../lib/clinical';
import { Comorbidity, OncologicalTreatment, TreatmentPhase } from '../../types';
import { Card } from '../ui/Card';
import { CheckboxCard } from '../ui/controls';

interface TreatmentFormProps {
  treatment: OncologicalTreatment;
  onChange: (treatment: OncologicalTreatment) => void;
}

const PHASE_DESCRIPTIONS: Record<TreatmentPhase, string> = {
  surveillance: 'Pas de traitement lourd en cours (25 à 30 kcal/kg/j et 1,0 à 1,2 g prot/kg/j)',
  radiotherapie: 'Irradiation tumorale en cours',
  chimiotherapie: 'Chimiothérapie cytotoxique / ciblée',
  immunotherapie: 'Inhibiteurs de checkpoints immunitaires'
};

const COMORBIDITIES: { key: Comorbidity; description: string; tone: 'amber' | 'rose' }[] = [
  { key: 'cirrhoseAscite', description: 'Calcul sur le poids sec et surveillance azotée', tone: 'amber' },
  {
    key: 'varicesOesophagiennes',
    description: 'Contre-indication relative pose de sonde nasogastrique',
    tone: 'amber'
  },
  {
    key: 'tubeDigestifNonFonctionnel',
    description: 'Occlusion, iléus, grêle court → Indication parentérale exclusive',
    tone: 'rose'
  }
];

const PHASES = Object.keys(PHASE_DESCRIPTIONS) as TreatmentPhase[];

function Panel({ title, aside, children }: { title: string; aside: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
        {aside}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

export function TreatmentForm({ treatment, onChange }: TreatmentFormProps) {
  /** « Surveillance » et les traitements actifs s'excluent mutuellement. */
  const togglePhase = (phase: TreatmentPhase) => {
    const checked = !treatment[phase];
    if (phase === 'surveillance') {
      onChange(
        checked
          ? { ...treatment, surveillance: true, radiotherapie: false, chimiotherapie: false, immunotherapie: false }
          : { ...treatment, surveillance: false }
      );
    } else {
      onChange({ ...treatment, [phase]: checked, surveillance: false });
    }
  };

  const active = isActiveTreatment(treatment);

  return (
    <Card
      icon={Pill}
      iconClassName="bg-indigo-50 text-indigo-700"
      title="Données du traitement oncologique"
      subtitle="Phases thérapeutiques et comorbidités ayant un impact nutritionnel"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel
          title="Phase du traitement"
          aside={
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                active ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              Cible : {active ? '30-35' : '25-30'} kcal/kg/j
            </span>
          }
        >
          {PHASES.map(phase => (
            <CheckboxCard
              key={phase}
              id={`treatment-${phase}`}
              checked={treatment[phase]}
              onChange={() => togglePhase(phase)}
              title={TREATMENT_PHASE_LABELS[phase]}
              description={PHASE_DESCRIPTIONS[phase]}
              tone={phase === 'surveillance' ? 'emerald' : 'indigo'}
            />
          ))}
        </Panel>

        <Panel title="Comorbidités" aside={<span className="text-xs text-slate-500">Précautions de prescription</span>}>
          {COMORBIDITIES.map(({ key, description, tone }) => (
            <CheckboxCard
              key={key}
              id={`comorbidity-${key}`}
              checked={treatment[key]}
              onChange={() => onChange({ ...treatment, [key]: !treatment[key] })}
              title={COMORBIDITY_LABELS[key]}
              description={description}
              tone={tone}
            />
          ))}
        </Panel>
      </div>
    </Card>
  );
}
