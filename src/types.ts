export type Sex = 'H' | 'F';
export type YesNo = 'oui' | 'non';

export interface PatientData {
  nom: string;
  age: string;
  sexe: Sex;
  /** cm */
  taille: string;
  /** kg */
  poidsActuel: string;
  /** kg */
  poids6Mois: string;
}

export type TreatmentPhase = 'surveillance' | 'radiotherapie' | 'chimiotherapie' | 'immunotherapie';
export type Comorbidity = 'cirrhoseAscite' | 'varicesOesophagiennes' | 'tubeDigestifNonFonctionnel';

export type OncologicalTreatment = Record<TreatmentPhase | Comorbidity, boolean>;

export type OralSupplementType =
  | 'HP/HC lacté'
  | 'HP/HC dessert'
  | 'jus de fruit'
  | 'soupe'
  | 'biscuits/madeleines';

export interface OralSupplementItem {
  id: string;
  type: OralSupplementType;
  countPerDay: number;
}

export type ArtificialRoute = 'enteral' | 'parenteral';

export interface ArtificialNutritionItem {
  id: string;
  bagName: string;
  volumeMl: number;
  /** Renseignés lorsqu'une poche du catalogue est sélectionnée. */
  kcalPer100ml?: number;
  proteinPer100ml?: number;
}

export interface NutritionalSupport {
  /** Score SEFI, de 0 à 10. */
  sefi: string;
  hasSupport: YesNo;
  hasOralSupplement: YesNo;
  oralSupplements: OralSupplementItem[];
  hasEnteral: YesNo;
  enteralItems: ArtificialNutritionItem[];
  hasParenteral: YesNo;
  parenteralItems: ArtificialNutritionItem[];
}

export type FoodUnit = 'unité' | 'cuillère à café' | 'bol' | 'mL' | 'assiette';

/** notFound : absent d'OpenFoodFacts, valeurs à saisir (manual) après recherche Google. */
export type FoodSource = 'openfoodfacts' | 'database' | 'manual' | 'notFound';

/** Valeurs nutritionnelles de référence d'un aliment, pour 100 g (ou 100 mL). */
export interface FoodNutrition {
  /** Texte recherché ayant produit ces valeurs. */
  query: string;
  productName: string;
  source: FoodSource;
  kcalPer100g: number;
  proteinPer100g: number;
  /** Poids en grammes d'une « unité » de cet aliment. */
  unitWeight: number;
}

export interface FoodItemEntry {
  id: string;
  name: string;
  quantity: number | '';
  unit: FoodUnit;
  nutrition?: FoodNutrition;
}

export type MealType =
  | 'petitDejeuner'
  | 'collationMatin'
  | 'dejeuner'
  | 'gouter'
  | 'diner'
  | 'collationSoir';

export interface FoodIntakeRecord {
  meals: Record<MealType, FoodItemEntry[]>;
  isValidated: boolean;
}

export interface Nutrients {
  kcal: number;
  prot: number;
}

export interface TargetCalculation {
  minKcal: number;
  maxKcal: number;
  minProt: number;
  maxProt: number;
  kcalPerKgLabel: string;
  protPerKgLabel: string;
  formulaKcalDesc: string;
  formulaProtDesc: string;
  isActiveTreatment: boolean;
}

export interface IntakeCalculation {
  food: Nutrients;
  oral: Nutrients;
  enteral: Nutrients;
  parenteral: Nutrients;
  total: Nutrients;
}

export type DeltaStatus = 'deficit' | 'adapted' | 'excess';

export interface DeltaCalculation {
  status: DeltaStatus;
  /** Positif = excès, négatif = déficit. */
  kcalDiff: number;
  protDiff: number;
  text: string;
}

export interface SuggestedCno {
  type: string;
  count: number;
  kcalProvided: number;
  proteinProvided: number;
}

export interface SfncmRecommendation {
  type: 'cno' | 'enteral' | 'parenteral' | 'adapted' | 'surveillance';
  title: string;
  details: string[];
  suggestedCno?: SuggestedCno[];
  clinicalAlerts: string[];
}
