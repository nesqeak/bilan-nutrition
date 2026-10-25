import { CommonFoodItem, findCommonFood } from '../data/commonFoods';
import { FoodNutrition } from '../types';

/**
 * Recherche des valeurs nutritionnelles (pour 100 g) d'un aliment saisi en texte libre sur OpenFoodFacts.
 * Si l'aliment ou sa valeur énergétique n'y figurent pas, la ligne passe au statut « notFound » :
 * l'utilisateur recherche les valeurs sur Google (voir googleNutritionSearchUrl) et les saisit lui-même.
 */

const REQUEST_TIMEOUT_MS = 5000;
const DEFAULT_UNIT_WEIGHT = 100;

async function fetchJson(url: string): Promise<any | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

const finiteOrNull = (value: unknown) => {
  const n = Number(value);
  return value !== undefined && value !== null && value !== '' && Number.isFinite(n) && n >= 0 ? n : null;
};

async function queryOpenFoodFacts(query: string) {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '10',
    fields: 'product_name,product_name_fr,nutriments'
  });
  const data = await fetchJson(`https://fr.openfoodfacts.org/cgi/search.pl?${params}`);

  for (const product of data?.products ?? []) {
    const n = product.nutriments ?? {};
    const kcal = finiteOrNull(n['energy-kcal_100g']);
    const kj = finiteOrNull(n['energy_100g']);
    const energy = kcal ?? (kj !== null ? Math.round(kj / 4.184) : null);
    // Sans valeur énergétique, le produit est considéré comme indisponible sur OpenFoodFacts.
    if (energy === null) continue;
    return {
      kcal: energy,
      prot: finiteOrNull(n['proteins_100g']) ?? 0,
      productName: (product.product_name_fr || product.product_name || query) as string
    };
  }
  return null;
}

/** Poids d'une « unité » : celui de la base locale si l'aliment y figure, 100 g sinon. */
export const unitWeightFor = (name: string) => findCommonFood(name)?.defaultUnitWeight ?? DEFAULT_UNIT_WEIGHT;

async function resolveFoodNutrition(query: string): Promise<FoodNutrition> {
  const off = await queryOpenFoodFacts(query);
  return {
    query,
    productName: off?.productName ?? query,
    source: off ? 'openfoodfacts' : 'notFound',
    kcalPer100g: off?.kcal ?? 0,
    proteinPer100g: off?.prot ?? 0,
    unitWeight: unitWeightFor(query)
  };
}

const cache = new Map<string, Promise<FoodNutrition>>();

/** Valeurs nutritionnelles d'un aliment sur OpenFoodFacts, mises en cache pour la session. */
export function lookupFoodNutrition(query: string): Promise<FoodNutrition> {
  const trimmed = query.trim();
  const key = trimmed.toLowerCase();
  let pending = cache.get(key);
  if (!pending) {
    pending = resolveFoodNutrition(trimmed);
    cache.set(key, pending);
  }
  return pending;
}

/** Recherche Google des valeurs nutritionnelles d'un aliment absent d'OpenFoodFacts. */
export const googleNutritionSearchUrl = (name: string) =>
  `https://www.google.com/search?${new URLSearchParams({
    q: `${name.trim()} valeurs nutritionnelles calories protéines pour 100 g`
  })}`;

/** Valeurs d'un aliment choisi dans les suggestions de la base locale. */
export function nutritionFromCommonFood(food: CommonFoodItem): FoodNutrition {
  return {
    query: food.name,
    productName: food.name,
    source: 'database',
    kcalPer100g: food.kcalPer100g,
    proteinPer100g: food.proteinPer100g,
    unitWeight: food.defaultUnitWeight
  };
}
