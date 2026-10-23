import {
  FoodIntakeRecord,
  NutritionalSupport,
  OncologicalTreatment,
  PatientData,
  Comorbidity,
  TreatmentPhase
} from '../types';
import {
  COMORBIDITY_LABELS,
  TREATMENT_PHASE_LABELS,
  calculateDelta,
  calculateNutritionalTargets,
  calculateTotalIntakes,
  computePatientMetrics,
  generateSfncmRecommendation
} from './clinical';

/** Rassemble l'ensemble des calculs affichés dans le bilan nutritionnel. */
export function buildNutritionalReport(
  patient: PatientData,
  treatment: OncologicalTreatment,
  support: NutritionalSupport,
  foodRecord: FoodIntakeRecord
) {
  const target = calculateNutritionalTargets(patient, treatment);
  const intake = calculateTotalIntakes(foodRecord, support);
  const delta = calculateDelta(intake, target);
  const recommendation = generateSfncmRecommendation(delta, support, treatment, patient);

  const treatments = (Object.keys(TREATMENT_PHASE_LABELS) as TreatmentPhase[])
    .filter(phase => treatment[phase])
    .map(phase => TREATMENT_PHASE_LABELS[phase]);

  const comorbidities = (Object.keys(COMORBIDITY_LABELS) as Comorbidity[])
    .filter(key => treatment[key])
    .map(key => COMORBIDITY_LABELS[key]);

  return {
    patient,
    sefi: support.sefi,
    metrics: computePatientMetrics(patient),
    target,
    intake,
    delta,
    recommendation,
    treatments: treatments.length ? treatments : ['Non renseigné (Surveillance par défaut)'],
    comorbidities,
    date: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())
  };
}

export type NutritionalReport = ReturnType<typeof buildNutritionalReport>;
