import { CommonFoodItem, findCommonFood } from '../data/commonFoods';
import { round1 } from '../lib/utils';
import { FoodNutrition } from '../types';
import { translateFoodQueryToEnglish } from './foodTranslation';

/**
 * Recherche des valeurs nutritionnelles (pour 100 g) d'un aliment saisi en texte libre :
 *   1. OpenFoodFacts ;
 *   2. si l'aliment ou ses valeurs énergétiques n'y sont pas, USDA FoodData Central
 *      (https://fdc.nal.usda.gov/), avec la requête traduite en anglais ;
 *   3. à défaut, la base locale d'aliments courants ;
 *   4. sinon, une estimation générique signalée comme telle.
 */

interface Per100g {
  kcal: number;
  prot: number;
  productName: string;
}

const REQUEST_TIMEOUT_MS = 5000;

/** Clé data.gov (gratuite) ; DEMO_KEY est limitée à quelques dizaines de requêtes/heure. */
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';

/** Valeurs appliquées quand aucune source ne connaît l'aliment. */
const GENERIC_ESTIMATE = { kcal: 120, prot: 4.5 };
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

/* ---------------------------- OpenFoodFacts ---------------------------- */

async function queryOpenFoodFacts(query: string): Promise<Per100g | null> {
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
      productName: product.product_name_fr || product.product_name || query
    };
  }
  return null;
}

/* ------------------------- USDA FoodData Central ------------------------ */

// Numéros de nutriments FDC : 208 = énergie (kcal), 957/958 = énergie Atwater (kcal),
// 268 = énergie (kJ), 203 = protéines (g). Les valeurs de /foods/search sont pour 100 g.
function parseUsdaFood(food: any): Per100g | null {
  const byNumber = new Map<string, number>();
  for (const n of food.foodNutrients ?? []) {
    const value = finiteOrNull(n.value);
    if (value !== null) byNumber.set(String(n.nutrientNumber), value);
  }

  const kj = byNumber.get('268');
  const kcal =
    byNumber.get('208') ?? byNumber.get('958') ?? byNumber.get('957') ?? (kj !== undefined ? kj / 4.184 : undefined);
  if (kcal === undefined) return null;

  return {
    kcal: Math.round(kcal),
    prot: round1(byNumber.get('203') ?? 0),
    productName: food.description || ''
  };
}

async function searchUsda(query: string, dataTypes: string): Promise<Per100g | null> {
  const params = new URLSearchParams({ query, dataType: dataTypes, pageSize: '10', api_key: USDA_API_KEY });
  const data = await fetchJson(`https://api.nal.usda.gov/fdc/v1/foods/search?${params}`);
  for (const food of data?.foods ?? []) {
    const parsed = parseUsdaFood(food);
    if (parsed) return { ...parsed, productName: parsed.productName || query };
  }
  return null;
}

async function queryUsdaFoodDataCentral(query: string): Promise<Per100g | null> {
  const englishQuery = translateFoodQueryToEnglish(query) ?? query;
  // Aliments génériques d'abord (plus représentatifs), produits de marque ensuite.
  return (
    (await searchUsda(englishQuery, 'Foundation,SR Legacy,Survey (FNDDS)')) ??
    (await searchUsda(englishQuery, 'Branded'))
  );
}

/* -------------------------------- Lookup -------------------------------- */

const cache = new Map<string, Promise<FoodNutrition>>();

async function resolveFoodNutrition(query: string): Promise<FoodNutrition> {
  const localMatch = findCommonFood(query);
  const unitWeight = localMatch?.defaultUnitWeight ?? DEFAULT_UNIT_WEIGHT;
  const build = (values: Per100g, source: FoodNutrition['source']): FoodNutrition => ({
    query,
    productName: values.productName,
    source,
    kcalPer100g: values.kcal,
    proteinPer100g: values.prot,
    unitWeight
  });

  const off = await queryOpenFoodFacts(query);
  if (off) return build(off, 'openfoodfacts');

  const usda = await queryUsdaFoodDataCentral(query);
  if (usda) return build(usda, 'usda');

  if (localMatch) {
    return build(
      { kcal: localMatch.kcalPer100g, prot: localMatch.proteinPer100g, productName: localMatch.name },
      'database'
    );
  }

  return build({ ...GENERIC_ESTIMATE, productName: query }, 'estimate');
}

/** Valeurs nutritionnelles d'un aliment, mises en cache pour la session. */
export function lookupFoodNutrition(query: string): Promise<FoodNutrition> {
  const trimmed = query.trim();
  const key = trimmed.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const pending = resolveFoodNutrition(trimmed);
  cache.set(key, pending);
  return pending;
}

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
