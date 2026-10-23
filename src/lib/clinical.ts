import { DEFAULT_BAG_PER_100ML, FOOD_UNITS, ORAL_SUPPLEMENTS } from '../data/referenceValues';
import { findNutritionBag } from '../data/nutritionBags';
import {
  ArtificialNutritionItem,
  ArtificialRoute,
  Comorbidity,
  DeltaCalculation,
  FoodIntakeRecord,
  FoodItemEntry,
  IntakeCalculation,
  Nutrients,
  NutritionalSupport,
  OncologicalTreatment,
  PatientData,
  SfncmRecommendation,
  SuggestedCno,
  TargetCalculation,
  TreatmentPhase
} from '../types';
import { round1, toPositiveNumber } from './utils';

/* ------------------------------------------------------------------ */
/* Patient                                                             */
/* ------------------------------------------------------------------ */

export interface PatientMetrics {
  weight: number;
  height: number;
  pastWeight: number;
  /** kg/m², arrondi à 0,1 */
  bmi: number | null;
  /** % de perte de poids sur 6 mois (négatif = prise de poids), arrondi à 0,1 */
  weightLossPct: number | null;
}

export function computePatientMetrics(patient: PatientData): PatientMetrics {
  const weight = toPositiveNumber(patient.poidsActuel);
  const height = toPositiveNumber(patient.taille);
  const pastWeight = toPositiveNumber(patient.poids6Mois);

  const bmi = weight && height ? round1(weight / (height / 100) ** 2) : null;
  const weightLossPct = weight && pastWeight ? round1(((pastWeight - weight) / pastWeight) * 100) : null;

  return { weight, height, pastWeight, bmi, weightLossPct };
}

export const TREATMENT_PHASE_LABELS: Record<TreatmentPhase, string> = {
  surveillance: 'Surveillance',
  radiotherapie: 'Radiothérapie',
  chimiotherapie: 'Chimiothérapie',
  immunotherapie: 'Immunothérapie'
};

export const COMORBIDITY_LABELS: Record<Comorbidity, string> = {
  cirrhoseAscite: 'Cirrhose avec ascite',
  varicesOesophagiennes: 'Varices œsophagiennes',
  tubeDigestifNonFonctionnel: 'Tube digestif non fonctionnel'
};

export const isActiveTreatment = (t: OncologicalTreatment) =>
  t.radiotherapie || t.chimiotherapie || t.immunotherapie;

/* ------------------------------------------------------------------ */
/* Cibles                                                              */
/* ------------------------------------------------------------------ */

const TARGET_RULES = {
  active: { kcal: [30, 35], prot: [1.2, 1.5], kcalLabel: '30 à 35', protLabel: '1,2 à 1,5', context: 'Traitement oncologique actif' },
  surveillance: { kcal: [25, 30], prot: [1.0, 1.2], kcalLabel: '25 à 30', protLabel: '1,0 à 1,2', context: 'Phase de surveillance' }
} as const;

export function calculateNutritionalTargets(
  patient: PatientData,
  treatment: OncologicalTreatment
): TargetCalculation {
  const weight = toPositiveNumber(patient.poidsActuel);
  const active = isActiveTreatment(treatment);
  const rule = active ? TARGET_RULES.active : TARGET_RULES.surveillance;
  const kcalPerKgLabel = `${rule.kcalLabel} kcal/kg/j`;
  const protPerKgLabel = `${rule.protLabel} g/kg/j`;

  return {
    minKcal: Math.round(weight * rule.kcal[0]),
    maxKcal: Math.round(weight * rule.kcal[1]),
    minProt: round1(weight * rule.prot[0]),
    maxProt: round1(weight * rule.prot[1]),
    kcalPerKgLabel,
    protPerKgLabel,
    formulaKcalDesc: `${rule.kcalLabel} kcal/kg/jour (${rule.context})`,
    formulaProtDesc: `${rule.protLabel} g/kg/jour (${rule.context})`,
    isActiveTreatment: active
  };
}

/* ------------------------------------------------------------------ */
/* Apports                                                             */
/* ------------------------------------------------------------------ */

/** Convertit une quantité saisie en grammes (ou mL). */
export function convertToGrams(quantity: number, unit: FoodItemEntry['unit'], unitWeight: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0;
  const fixed = FOOD_UNITS.find(u => u.value === unit)?.grams;
  return quantity * (fixed ?? unitWeight);
}

/** Vrai si les valeurs nutritionnelles de la ligne correspondent au nom saisi. */
export const hasCurrentNutrition = (item: FoodItemEntry) =>
  !!item.nutrition && item.nutrition.query.trim().toLowerCase() === item.name.trim().toLowerCase();

/** Vrai si l'aliment saisi doit encore être recherché. */
export const needsNutritionLookup = (item: FoodItemEntry) => item.name.trim().length > 1 && !hasCurrentNutrition(item);

/** Apports d'une ligne du relevé alimentaire (0 tant que l'aliment n'est pas identifié). */
export function computeFoodItemNutrients(item: FoodItemEntry): Nutrients {
  if (!item.nutrition || !hasCurrentNutrition(item)) return { kcal: 0, prot: 0 };
  const grams = convertToGrams(toPositiveNumber(item.quantity), item.unit, item.nutrition.unitWeight);
  return {
    kcal: Math.round((grams / 100) * item.nutrition.kcalPer100g),
    prot: round1((grams / 100) * item.nutrition.proteinPer100g)
  };
}

export const sumNutrients = (list: Nutrients[]): Nutrients =>
  list.reduce((acc, n) => ({ kcal: acc.kcal + n.kcal, prot: acc.prot + n.prot }), { kcal: 0, prot: 0 });

const roundNutrients = (n: Nutrients): Nutrients => ({ kcal: Math.round(n.kcal), prot: round1(n.prot) });

export const allFoodItems = (record: FoodIntakeRecord) => Object.values(record.meals).flat();

export const filledFoodItems = (record: FoodIntakeRecord) =>
  allFoodItems(record).filter(item => item.name.trim());

function artificialNutrients(items: ArtificialNutritionItem[], route: ArtificialRoute): Nutrients {
  return sumNutrients(
    items.map(item => {
      const bag = findNutritionBag(item.bagName, route);
      const kcalPer100 = item.kcalPer100ml ?? bag?.kcalPer100ml ?? DEFAULT_BAG_PER_100ML[route].kcal;
      const protPer100 = item.proteinPer100ml ?? bag?.proteinPer100ml ?? DEFAULT_BAG_PER_100ML[route].prot;
      const factor = toPositiveNumber(item.volumeMl) / 100;
      return { kcal: factor * kcalPer100, prot: factor * protPer100 };
    })
  );
}

export function calculateTotalIntakes(record: FoodIntakeRecord, support: NutritionalSupport): IntakeCalculation {
  const none: Nutrients = { kcal: 0, prot: 0 };
  const hasSupport = support.hasSupport === 'oui';

  const food = sumNutrients(allFoodItems(record).map(computeFoodItemNutrients));

  const oral =
    hasSupport && support.hasOralSupplement === 'oui'
      ? sumNutrients(
          support.oralSupplements.map(item => {
            const count = toPositiveNumber(item.countPerDay);
            const unit = ORAL_SUPPLEMENTS[item.type];
            return { kcal: count * unit.kcal, prot: count * unit.prot };
          })
        )
      : none;

  const enteral =
    hasSupport && support.hasEnteral === 'oui' ? artificialNutrients(support.enteralItems, 'enteral') : none;

  const parenteral =
    hasSupport && support.hasParenteral === 'oui'
      ? artificialNutrients(support.parenteralItems, 'parenteral')
      : none;

  return {
    food: roundNutrients(food),
    oral: roundNutrients(oral),
    enteral: roundNutrients(enteral),
    parenteral: roundNutrients(parenteral),
    total: roundNutrients(sumNutrients([food, oral, enteral, parenteral]))
  };
}

/* ------------------------------------------------------------------ */
/* Écart aux cibles                                                    */
/* ------------------------------------------------------------------ */

export function calculateDelta(intake: IntakeCalculation, target: TargetCalculation): DeltaCalculation {
  if (target.maxKcal === 0) {
    return {
      status: 'adapted',
      kcalDiff: 0,
      protDiff: 0,
      text: 'Renseignez le poids du patient pour calculer les objectifs.'
    };
  }

  const { kcal, prot } = intake.total;
  const kcalDeficit = Math.max(0, target.minKcal - kcal);
  const protDeficit = round1(Math.max(0, target.minProt - prot));

  if (kcalDeficit > 0 || protDeficit > 0) {
    return {
      status: 'deficit',
      kcalDiff: -kcalDeficit || 0,
      protDiff: -protDeficit || 0,
      text: `Déficit de ${kcalDeficit} kcal et ${protDeficit} g de protéines`
    };
  }

  const kcalExcess = Math.max(0, kcal - target.maxKcal);
  const protExcess = round1(Math.max(0, prot - target.maxProt));

  if (kcalExcess > 0 || protExcess > 0) {
    return {
      status: 'excess',
      kcalDiff: kcalExcess,
      protDiff: protExcess,
      text: `Apports trop importants (+${kcalExcess} kcal, +${protExcess} g protéines)`
    };
  }

  return { status: 'adapted', kcalDiff: 0, protDiff: 0, text: 'Apports adaptés' };
}

/* ------------------------------------------------------------------ */
/* Recommandation SFNCM                                                */
/* ------------------------------------------------------------------ */

/** Au-delà de ce déficit (kcal/j), ou si SEFI < 5, une nutrition artificielle est indiquée. */
const ARTIFICIAL_NUTRITION_DEFICIT_KCAL = 750;
const SEFI_LOW_THRESHOLD = 5;

const CNO_DAIRY = 'HP/HC lacté ou dessert';

function suggestCno(kcalDeficit: number): SuggestedCno[] {
  if (kcalDeficit <= 400) {
    return [{ type: CNO_DAIRY, count: 1, kcalProvided: 400, proteinProvided: 20 }];
  }
  if (kcalDeficit <= 600) {
    return [
      { type: CNO_DAIRY, count: 1, kcalProvided: 400, proteinProvided: 20 },
      { type: 'Jus de fruit hypercalorique ou biscuits HP', count: 1, kcalProvided: 200, proteinProvided: 6 }
    ];
  }
  return [{ type: CNO_DAIRY, count: 2, kcalProvided: 800, proteinProvided: 40 }];
}

function buildClinicalAlerts(treatment: OncologicalTreatment, patient: PatientData): string[] {
  const alerts: string[] = [];

  if (treatment.cirrhoseAscite) {
    alerts.push(
      "Cirrhose avec ascite : Utiliser le poids sec estimé (déduction de l'ascite) pour le calcul des cibles. Maintenir un apport protéique adéquat (1,2-1,5 g/kg/j) pour prévenir la fonte musculaire, avec surveillance du bilan hépatique."
    );
  }
  if (treatment.varicesOesophagiennes) {
    alerts.push(
      "Varices œsophagiennes : Risque hémorragique en cas de pose de sonde nasogastrique (SNG). Éviter la pose à l'aveugle en cas de varices de grade élevé non ligaturées. Privilégier une voie parentérale ou avis gastro-entérologique avant sonde."
    );
  }
  if (treatment.tubeDigestifNonFonctionnel) {
    alerts.push(
      'Tube digestif non fonctionnel : Contre-indication absolue à la nutrition entérale par voie digestive. Indication exclusive de nutrition parentérale (NP).'
    );
  }

  const { weightLossPct } = computePatientMetrics(patient);
  if (weightLossPct !== null && weightLossPct >= 5) {
    const severity = weightLossPct >= 10 ? 'majeure' : 'significative';
    const grade = weightLossPct >= 10 ? 'sévère' : 'modérée';
    alerts.push(
      `Perte de poids ${severity} de ${weightLossPct.toFixed(1)}% sur 6 mois (critère diagnostique de dénutrition ${grade} selon l'HAS/SFNCM).`
    );
  }

  return alerts;
}

export function generateSfncmRecommendation(
  delta: DeltaCalculation,
  support: NutritionalSupport,
  treatment: OncologicalTreatment,
  patient: PatientData
): SfncmRecommendation {
  const clinicalAlerts = buildClinicalAlerts(treatment, patient);
  const sefiScore = parseFloat(support.sefi);
  const hasSefi = Number.isFinite(sefiScore);
  const isSefiLow = hasSefi && sefiScore < SEFI_LOW_THRESHOLD;

  if (delta.status === 'adapted') {
    return {
      type: 'adapted',
      title: 'Apports nutritionnels conformes aux objectifs de référence',
      details: [
        'Les apports actuels couvrent les besoins énergétiques et protéiques cibles du patient.',
        'Poursuivre la surveillance pondérale hebdomadaire et réévaluer les ingestas à chaque cure ou consultation.',
        "Maintenir les conseils diététiques d'enrichissement naturel et l'hydratation orale."
      ],
      clinicalAlerts
    };
  }

  if (delta.status === 'excess') {
    return {
      type: 'surveillance',
      title: 'Apports légèrement supérieurs aux objectifs cibles',
      details: [
        'Les apports énergétiques ou protéiques dépassent la fourchette haute des recommandations.',
        'Vérifier la bonne tolérance digestive (absence de diarrhées, de nausées ou de surcharge liquidienne).',
        "Adapter ou espacer les compléments nutritionnels oraux si le patient s'alimente très bien spontanément."
      ],
      clinicalAlerts
    };
  }

  const kcalDeficit = Math.abs(delta.kcalDiff);

  if (kcalDeficit > ARTIFICIAL_NUTRITION_DEFICIT_KCAL || isSefiLow) {
    if (treatment.tubeDigestifNonFonctionnel) {
      return {
        type: 'parenteral',
        title: 'Indication de Nutrition Parentérale (NP) exclusive ou complémentaire',
        details: [
          `Déficit énergétique important (${kcalDeficit} kcal/j) ${isSefiLow ? `et score SEFI très bas (${sefiScore}/10)` : ''} associé à un tube digestif non fonctionnel.`,
          "Mise en place d'une nutrition parentérale sur voie veineuse centrale (PICC Line ou chambre implantable CCI) avec poche tricompartiment adaptée aux besoins azotés et caloriques.",
          'Surveillance hydro-électrolytique (ionogramme sanguin, glycémie, triglycérides, bilan hépatique, phosphorémie pour prévention du syndrome de renutrition inappropriée SRI).',
          'Supplémentation systématique en vitamines (ex: Cernevit) et oligo-éléments (ex: Nutryelt).'
        ],
        clinicalAlerts
      };
    }
    return {
      type: 'enteral',
      title: 'Indication de Nutrition Entérale (NE) à domicile ou hospitalière',
      details: [
        `Déficit énergétique sévère (${kcalDeficit} kcal/j > ${ARTIFICIAL_NUTRITION_DEFICIT_KCAL} kcal) ${isSefiLow ? `et/ou score SEFI < 5 (${sefiScore}/10)` : ''} avec tube digestif fonctionnel.`,
        'Conformément aux recommandations SFNCM/ESMO, la nutrition entérale par sonde naso-gastrique (SNG en polyuréthane ou silicone) ou gastrostomie percutanée (GPE si durée prévue > 4 semaines) est le traitement de référence de première intention.',
        "Prescription d'une formule polymérique hypercalorique/hyperprotéinée (1,5 à 2 kcal/mL) en débit continu régulé par pompe de nutrition.",
        'Démarrage progressif par paliers pour prévenir le syndrome de renutrition inappropriée (SRI) avec surveillance du phosphore, potassium et magnésium.'
      ],
      clinicalAlerts
    };
  }

  const suggestedCno = suggestCno(kcalDeficit);
  const cnoTotal = sumNutrients(suggestedCno.map(c => ({ kcal: c.kcalProvided, prot: c.proteinProvided })));

  return {
    type: 'cno',
    title: 'Proposition de Complémentation Nutritionnelle Orale (CNO)',
    details: [
      `Déficit modéré (${kcalDeficit} kcal/j ≤ ${ARTIFICIAL_NUTRITION_DEFICIT_KCAL} kcal) et SEFI ≥ 5 (${hasSefi ? `${sefiScore}/10` : 'satisfaisant'}).`,
      `Prescription recommandée de Compléments Nutritionnels Oraux (CNO) hypercaloriques et hyperprotéinés (apport théorique : ~${cnoTotal.kcal} kcal et ~${cnoTotal.prot} g de protéines par jour).`,
      "Modalités de prise : à consommer à distance des repas principaux (10h, 16h ou au coucher) pour ne pas altérer l'appétit spontané.",
      'Conseiller de varier les textures (boissons lactées fraîches, crèmes desserts, jus fruités, soupes chaudes) et les arômes pour optimiser l\'observance.',
      "Associer un enrichissement de l'alimentation traditionnelle (beurre, crème, fromage râpé, poudre de lait, œufs) et un fractionnement des prises alimentaires (5 à 6 prises/jour)."
    ],
    suggestedCno,
    clinicalAlerts
  };
}
