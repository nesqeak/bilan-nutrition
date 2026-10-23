export type Sex = 'H' | 'F';

export interface PatientData {
  nom: string;
  age: string;
  sexe: Sex;
  taille: string; // in cm
  poidsActuel: string; // in kg
  poids6Mois: string; // in kg
}

export interface OncologicalTreatment {
  // Phase du traitement
  surveillance: boolean;
  radiotherapie: boolean;
  chimiotherapie: boolean;
  immunotherapie: boolean;

  // Comorbidités
  cirrhoseAscite: boolean;
  varicesOesophagiennes: boolean;
  tubeDigestifNonFonctionnel: boolean;
}

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

export interface ArtificialNutritionItem {
  id: string;
  bagName: string;
  volumeMl: number;
  kcalPer100ml?: number;
  proteinPer100ml?: number;
}

export interface NutritionalSupport {
  sefi: string; // 0 to 10
  hasSupport: 'oui' | 'non';
  
  // Complémentation Orale
  hasOralSupplement: 'oui' | 'non';
  oralSupplements: OralSupplementItem[];

  // Alimentation entérale
  hasEnteral: 'oui' | 'non';
  enteralItems: ArtificialNutritionItem[];

  // Alimentation parentérale
  hasParenteral: 'oui' | 'non';
  parenteralItems: ArtificialNutritionItem[];
}

export type FoodUnit = 'unité' | 'cuillère à café' | 'bol' | 'mL' | 'assiette';

export interface FoodItemEntry {
  id: string;
  name: string;
  quantity: number | '';
  unit: FoodUnit;
  calories?: number;
  proteins?: number;
  source?: 'openfoodfacts' | 'usda' | 'database' | 'custom';
  productNameFound?: string;
  isLoading?: boolean;
}

export type MealType =
  | 'petitDejeuner'
  | 'collationMatin'
  | 'dejeuner'
  | 'gouter'
  | 'diner'
  | 'collationSoir';

export interface FoodIntakeRecord {
  petitDejeuner: FoodItemEntry[];
  collationMatin: FoodItemEntry[];
  dejeuner: FoodItemEntry[];
  gouter: FoodItemEntry[];
  diner: FoodItemEntry[];
  collationSoir: FoodItemEntry[];
  isValidated: boolean;
}

export interface TargetCalculation {
  minKcal: number;
  maxKcal: number;
  minProt: number;
  maxProt: number;
  formulaKcalDesc: string;
  formulaProtDesc: string;
  isActiveTreatment: boolean;
}

export interface IntakeCalculation {
  foodKcal: number;
  foodProt: number;
  oralKcal: number;
  oralProt: number;
  enteralKcal: number;
  enteralProt: number;
  parenteralKcal: number;
  parenteralProt: number;
  totalKcal: number;
  totalProt: number;
}

export type DeltaStatus = 'deficit' | 'adapted' | 'excess';

export interface DeltaCalculation {
  status: DeltaStatus;
  kcalDiff: number; // positive = excess, negative = deficit
  protDiff: number; // positive = excess, negative = deficit
  text: string;
}

export interface SfncmRecommendation {
  type: 'cno' | 'enteral' | 'parenteral' | 'adapted' | 'surveillance' | 'none';
  title: string;
  details: string[];
  suggestedCno?: {
    type: string;
    count: number;
    kcalProvided: number;
    proteinProvided: number;
  }[];
  clinicalAlerts?: string[];
}
