import { AlertTriangle, User } from 'lucide-react';
import { computePatientMetrics } from '../../lib/clinical';
import { PatientData, Sex } from '../../types';
import { Card } from '../ui/Card';
import { Field, SegmentedControl, TextInput } from '../ui/controls';

interface PatientFormProps {
  patient: PatientData;
  onChange: (patient: PatientData) => void;
}

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'H', label: 'Homme (H)' },
  { value: 'F', label: 'Femme (F)' }
];

const bmiBadgeClass = (bmi: number) =>
  bmi < 18.5 ? 'bg-rose-100 text-rose-800' : bmi >= 25 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

const weightLossBadgeClass = (pct: number) =>
  pct >= 10
    ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-300'
    : pct >= 5
      ? 'bg-amber-100 text-amber-800'
      : 'bg-slate-100 text-slate-700';

export function PatientForm({ patient, onChange }: PatientFormProps) {
  const set = <K extends keyof PatientData>(field: K, value: PatientData[K]) =>
    onChange({ ...patient, [field]: value });

  const { bmi, weightLossPct } = computePatientMetrics(patient);

  const badges = (
    <>
      {bmi !== null && (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${bmiBadgeClass(bmi)}`}>
          IMC : {bmi} kg/m²
        </span>
      )}
      {weightLossPct !== null && weightLossPct > 0 && (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${weightLossBadgeClass(weightLossPct)}`}
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Perte : -{weightLossPct}% (6m)
        </span>
      )}
    </>
  );

  return (
    <Card
      icon={User}
      iconClassName="bg-teal-50 text-teal-700"
      title="Données du patient"
      subtitle="Informations anthropométriques et administratives"
      aside={badges}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Nom et Prénom du patient" htmlFor="patient-nom">
          <TextInput
            id="patient-nom"
            placeholder="Ex: Dupont Jean"
            value={patient.nom}
            onChange={e => set('nom', e.target.value)}
          />
        </Field>

        <Field label="Âge (ans)" htmlFor="patient-age">
          <TextInput
            id="patient-age"
            type="number"
            min={0}
            max={125}
            placeholder="Ex: 68"
            value={patient.age}
            onChange={e => set('age', e.target.value)}
          />
        </Field>

        <Field label="Sexe">
          <SegmentedControl
            ariaLabel="Sexe"
            value={patient.sexe}
            options={SEX_OPTIONS}
            onChange={value => set('sexe', value)}
          />
        </Field>

        <Field label="Taille" htmlFor="patient-taille">
          <TextInput
            id="patient-taille"
            type="number"
            min={50}
            max={250}
            placeholder="Ex: 172"
            suffix="cm"
            value={patient.taille}
            onChange={e => set('taille', e.target.value)}
          />
        </Field>

        <Field
          label={
            <>
              Poids actuel <span className="text-emerald-600 font-bold">*</span>
            </>
          }
          htmlFor="patient-poids-actuel"
        >
          <TextInput
            id="patient-poids-actuel"
            type="number"
            step={0.1}
            min={20}
            max={300}
            placeholder="Ex: 64.5"
            suffix="kg"
            className="font-semibold"
            value={patient.poidsActuel}
            onChange={e => set('poidsActuel', e.target.value)}
          />
        </Field>

        <Field label="Poids il y a 6 mois" htmlFor="patient-poids-6mois">
          <TextInput
            id="patient-poids-6mois"
            type="number"
            step={0.1}
            min={20}
            max={300}
            placeholder="Ex: 72.0"
            suffix="kg"
            value={patient.poids6Mois}
            onChange={e => set('poids6Mois', e.target.value)}
          />
        </Field>
      </div>
    </Card>
  );
}
