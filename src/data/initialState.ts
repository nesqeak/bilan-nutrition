import { FoodIntakeRecord, NutritionalSupport, OncologicalTreatment, PatientData } from '../types';

export const INITIAL_PATIENT: PatientData = {
  nom: '',
  age: '',
  sexe: 'H',
  taille: '',
  poidsActuel: '',
  poids6Mois: ''
};

export const INITIAL_TREATMENT: OncologicalTreatment = {
  surveillance: true,
  radiotherapie: false,
  chimiotherapie: false,
  immunotherapie: false,
  cirrhoseAscite: false,
  varicesOesophagiennes: false,
  tubeDigestifNonFonctionnel: false
};

export const INITIAL_SUPPORT: NutritionalSupport = {
  sefi: '7',
  hasSupport: 'non',
  hasOralSupplement: 'non',
  oralSupplements: [],
  hasEnteral: 'non',
  enteralItems: [],
  hasParenteral: 'non',
  parenteralItems: []
};

export const INITIAL_FOOD_RECORD: FoodIntakeRecord = {
  meals: {
    petitDejeuner: [],
    collationMatin: [],
    dejeuner: [],
    gouter: [],
    diner: [],
    collationSoir: []
  },
  isValidated: false
};
