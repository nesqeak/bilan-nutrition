import { FoodUnit, MealType, Nutrients, OralSupplementType } from '../types';

/** Apports d'une unité de complément nutritionnel oral. */
export const ORAL_SUPPLEMENTS: Record<OralSupplementType, Nutrients> = {
  'HP/HC lacté': { kcal: 400, prot: 20 },
  'HP/HC dessert': { kcal: 400, prot: 20 },
  'jus de fruit': { kcal: 300, prot: 8 },
  soupe: { kcal: 300, prot: 20 },
  'biscuits/madeleines': { kcal: 75, prot: 4 }
};

export const ORAL_SUPPLEMENT_TYPES = Object.keys(ORAL_SUPPLEMENTS) as OralSupplementType[];

/** Valeurs par défaut (pour 100 mL) d'une poche absente du catalogue. */
export const DEFAULT_BAG_PER_100ML: Record<'enteral' | 'parenteral', Nutrients> = {
  enteral: { kcal: 125, prot: 5.5 },
  parenteral: { kcal: 100, prot: 5 }
};

interface FoodUnitDefinition {
  value: FoodUnit;
  /** Équivalence fixe en g/mL ; absente pour « unité » (dépend de l'aliment). */
  grams?: number;
  hint?: string;
}

export const FOOD_UNITS: FoodUnitDefinition[] = [
  { value: 'unité' },
  { value: 'cuillère à café', grams: 5, hint: '5 mL' },
  { value: 'bol', grams: 250, hint: '250 mL' },
  { value: 'mL', grams: 1 },
  { value: 'assiette', grams: 250, hint: '250 g' }
];

export const MEALS: { key: MealType; label: string; time: string }[] = [
  { key: 'petitDejeuner', label: 'Petit déjeuner', time: 'Matinée' },
  { key: 'collationMatin', label: 'Collation du matin', time: '10h - 11h' },
  { key: 'dejeuner', label: 'Déjeuner', time: 'Midi' },
  { key: 'gouter', label: 'Goûter', time: '16h - 17h' },
  { key: 'diner', label: 'Dîner', time: 'Soir' },
  { key: 'collationSoir', label: 'Collation du soir', time: 'Coucher / Nuit' }
];
