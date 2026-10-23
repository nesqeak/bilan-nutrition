import {
  PatientData,
  OncologicalTreatment,
  NutritionalSupport,
  FoodIntakeRecord,
  FoodItemEntry,
  FoodUnit,
  TargetCalculation,
  IntakeCalculation,
  DeltaCalculation,
  SfncmRecommendation,
  OralSupplementType
} from '../types';
import { COMMON_FRENCH_FOODS, searchCommonFoods } from '../data/commonFoods';
import { findNutritionBag } from '../data/nutritionBags';

// In-memory cache for nutritional lookups (OpenFoodFacts, USDA FoodData Central, local)
const foodNutritionCache = new Map<
  string,
  { kcal: number; prot: number; productName: string; source: 'openfoodfacts' | 'usda' | 'database' | 'custom' }
>();

/**
 * Convert quantity and unit to equivalent grams/mL
 */
export function convertToGramsOrMl(quantity: number, unit: FoodUnit, defaultUnitWeight = 100): number {
  if (isNaN(quantity) || quantity <= 0) return 0;
  switch (unit) {
    case 'cuillère à café':
      return quantity * 5;
    case 'bol':
      return quantity * 250;
    case 'assiette':
      return quantity * 250;
    case 'mL':
      return quantity;
    case 'unité':
    default:
      return quantity * defaultUnitWeight;
  }
}

/**
 * Query OpenFoodFacts for nutritional values (energy & protein per 100g)
 */
async function queryOpenFoodFacts(
  query: string
): Promise<{ kcal: number; prot: number; productName: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      query
    )}&search_simple=1&action=process&json=1&page_size=5`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BilanNutritionnelOnco - WebApp - Version1.0' }
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();
    if (!data || !data.products || data.products.length === 0) return null;

    // Find the best product with energy and/or protein
    const product =
      data.products.find(
        (p: any) =>
          p.nutriments &&
          (p.nutriments['energy-kcal_100g'] !== undefined || p.nutriments['energy_100g'] !== undefined)
      ) || data.products[0];

    if (!product || !product.nutriments) return null;

    const hasKcal =
      product.nutriments['energy-kcal_100g'] !== undefined || product.nutriments['energy_100g'] !== undefined;
    const hasProt = product.nutriments['proteins_100g'] !== undefined;

    // If neither calories nor proteins are available, consider it unavailable on OpenFoodFacts
    if (!hasKcal && !hasProt) return null;

    const kcal =
      product.nutriments['energy-kcal_100g'] !== undefined
        ? Number(product.nutriments['energy-kcal_100g'])
        : product.nutriments['energy_100g'] !== undefined
        ? Math.round(Number(product.nutriments['energy_100g']) / 4.184)
        : 0;

    const prot =
      product.nutriments['proteins_100g'] !== undefined
        ? Number(product.nutriments['proteins_100g'])
        : 0;

    const productName = product.product_name_fr || product.product_name || query;

    return {
      kcal: Math.max(0, kcal),
      prot: Math.max(0, prot),
      productName
    };
  } catch (err) {
    return null;
  }
}

/**
 * Query USDA FoodData Central (https://fdc.nal.usda.gov/) when food is not found on OpenFoodFacts
 */
async function queryUsdaFoodDataCentral(
  query: string
): Promise<{ kcal: number; prot: number; productName: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Official USDA FoodData Central API endpoint (fdc.nal.usda.gov)
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
      query
    )}&pageSize=5&api_key=DEMO_KEY`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();
    if (!data || !data.foods || data.foods.length === 0) return null;

    for (const food of data.foods) {
      if (!Array.isArray(food.foodNutrients)) continue;

      let kcal: number | null = null;
      let prot: number | null = null;

      for (const n of food.foodNutrients) {
        const name = (n.nutrientName || '').toLowerCase();
        const num = String(n.nutrientNumber || '');
        const unit = (n.unitName || '').toUpperCase();
        const val = Number(n.value);

        if (isNaN(val) || val < 0) continue;

        // Energy (nutrient 208, or containing 'energy')
        if (kcal === null && (num === '208' || name.includes('energy'))) {
          if (unit === 'KCAL') {
            kcal = Math.round(val);
          } else if (unit === 'KJ') {
            kcal = Math.round(val / 4.184);
          }
        }

        // Protein (nutrient 203, or containing 'protein')
        if (prot === null && (num === '203' || name.includes('protein'))) {
          prot = Math.round(val * 10) / 10;
        }
      }

      if (kcal !== null || prot !== null) {
        return {
          kcal: kcal !== null ? Math.max(0, kcal) : 0,
          prot: prot !== null ? Math.max(0, prot) : 0,
          productName: food.description || query
        };
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Search nutritional values:
 * 1. Cache
 * 2. OpenFoodFacts
 * 3. Fallback: USDA FoodData Central (https://fdc.nal.usda.gov/)
 * 4. Fallback: Curated French clinical food database
 * 5. General sensible estimate
 */
export async function lookupFoodNutrition(
  query: string
): Promise<{
  kcalPer100g: number;
  proteinPer100g: number;
  productName: string;
  defaultWeight: number;
  source: 'openfoodfacts' | 'usda' | 'database' | 'custom';
}> {
  if (!query || query.trim() === '') {
    return { kcalPer100g: 0, proteinPer100g: 0, productName: '', defaultWeight: 100, source: 'custom' };
  }

  const cleanQuery = query.trim().toLowerCase();

  // 1. Check in-memory cache
  if (foodNutritionCache.has(cleanQuery)) {
    const cached = foodNutritionCache.get(cleanQuery)!;
    return {
      kcalPer100g: cached.kcal,
      proteinPer100g: cached.prot,
      productName: cached.productName,
      defaultWeight: 100,
      source: cached.source
    };
  }

  // Check local French catalog for unit weights / portion heuristics
  const localMatch =
    COMMON_FRENCH_FOODS.find(
      item =>
        item.name.toLowerCase() === cleanQuery ||
        (item.synonyms && item.synonyms.some(s => s.toLowerCase() === cleanQuery))
    ) ||
    COMMON_FRENCH_FOODS.find(
      item =>
        item.name.toLowerCase().includes(cleanQuery) ||
        (item.synonyms && item.synonyms.some(s => cleanQuery.includes(s.toLowerCase())))
    );

  const defaultWeight = localMatch ? localMatch.defaultUnitWeight : 100;

  // 2. Try OpenFoodFacts API
  const offResult = await queryOpenFoodFacts(query);
  if (offResult) {
    foodNutritionCache.set(cleanQuery, {
      kcal: offResult.kcal,
      prot: offResult.prot,
      productName: offResult.productName,
      source: 'openfoodfacts'
    });
    return {
      kcalPer100g: offResult.kcal,
      proteinPer100g: offResult.prot,
      productName: offResult.productName,
      defaultWeight,
      source: 'openfoodfacts'
    };
  }

  // 3. If unavailable on OpenFoodFacts, fallback to USDA FoodData Central (https://fdc.nal.usda.gov/)
  const usdaResult = await queryUsdaFoodDataCentral(query);
  if (usdaResult) {
    foodNutritionCache.set(cleanQuery, {
      kcal: usdaResult.kcal,
      prot: usdaResult.prot,
      productName: usdaResult.productName,
      source: 'usda'
    });
    return {
      kcalPer100g: usdaResult.kcal,
      proteinPer100g: usdaResult.prot,
      productName: usdaResult.productName,
      defaultWeight,
      source: 'usda'
    };
  }

  // 4. Fallback to local curated medical / French food database
  if (localMatch) {
    foodNutritionCache.set(cleanQuery, {
      kcal: localMatch.kcalPer100g,
      prot: localMatch.proteinPer100g,
      productName: localMatch.name,
      source: 'database'
    });
    return {
      kcalPer100g: localMatch.kcalPer100g,
      proteinPer100g: localMatch.proteinPer100g,
      productName: localMatch.name,
      defaultWeight: localMatch.defaultUnitWeight,
      source: 'database'
    };
  }

  // 5. If unknown general food, apply sensible default estimate
  const defaultEstimate = {
    kcalPer100g: 120,
    proteinPer100g: 4.5,
    productName: query,
    defaultWeight: 100,
    source: 'custom' as const
  };
  return defaultEstimate;
}

/**
 * Calculate Nutritional Targets based on patient weight and oncological treatment phase
 */
export function calculateNutritionalTargets(
  patient: PatientData,
  treatment: OncologicalTreatment
): TargetCalculation {
  const weight = parseFloat(patient.poidsActuel) || 0;

  // Active treatment phase check
  const isActiveTreatment =
    treatment.chimiotherapie || treatment.radiotherapie || treatment.immunotherapie;

  if (isActiveTreatment) {
    // 30 to 35 kcal/kg/d and 1.2 to 1.5 g protein/kg/d
    const minKcal = Math.round(weight * 30);
    const maxKcal = Math.round(weight * 35);
    const minProt = Math.round(weight * 1.2 * 10) / 10;
    const maxProt = Math.round(weight * 1.5 * 10) / 10;

    return {
      minKcal,
      maxKcal,
      minProt,
      maxProt,
      formulaKcalDesc: '30 à 35 kcal/kg/jour (Traitement oncologique actif)',
      formulaProtDesc: '1,2 à 1,5 g/kg/jour (Traitement oncologique actif)',
      isActiveTreatment: true
    };
  } else {
    // Surveillance: 25 to 30 kcal/kg/d and 1.0 to 1.2 g protein/kg/d
    const minKcal = Math.round(weight * 25);
    const maxKcal = Math.round(weight * 30);
    const minProt = Math.round(weight * 1.0 * 10) / 10;
    const maxProt = Math.round(weight * 1.2 * 10) / 10;

    return {
      minKcal,
      maxKcal,
      minProt,
      maxProt,
      formulaKcalDesc: '25 à 30 kcal/kg/jour (Phase de surveillance)',
      formulaProtDesc: '1,0 à 1,2 g/kg/jour (Phase de surveillance)',
      isActiveTreatment: false
    };
  }
}

/**
 * Nutritional values for Oral Supplements according to specifications:
 * - HP/HC lacté ou dessert : 400 kcal & 20g protéines
 * - 1 complément jus : 300 kcal & 8g protéines
 * - 1 soupe : 300 kcal & 20g protéines
 * - biscuits/madeleines : 75 kcal & 4g protéines
 */
export function getOralSupplementNutriments(type: OralSupplementType): { kcal: number; prot: number } {
  switch (type) {
    case 'HP/HC lacté':
    case 'HP/HC dessert':
      return { kcal: 400, prot: 20 };
    case 'jus de fruit':
      return { kcal: 300, prot: 8 };
    case 'soupe':
      return { kcal: 300, prot: 20 };
    case 'biscuits/madeleines':
      return { kcal: 75, prot: 4 };
    default:
      return { kcal: 300, prot: 10 };
  }
}

/**
 * Calculate total intake broken down into spontaneous food, oral supplements, and artificial nutrition
 */
export function calculateTotalIntakes(
  foodRecord: FoodIntakeRecord,
  support: NutritionalSupport
): IntakeCalculation {
  // 1. Spontaneous Food Intake (Relevé alimentaire)
  let foodKcal = 0;
  let foodProt = 0;

  const allMeals: FoodItemEntry[] = [
    ...foodRecord.petitDejeuner,
    ...foodRecord.collationMatin,
    ...foodRecord.dejeuner,
    ...foodRecord.gouter,
    ...foodRecord.diner,
    ...foodRecord.collationSoir
  ];

  for (const item of allMeals) {
    if (item.calories) foodKcal += item.calories;
    if (item.proteins) foodProt += item.proteins;
  }

  // 2. Oral Supplementation (Complémentation Orale)
  let oralKcal = 0;
  let oralProt = 0;

  if (support.hasSupport === 'oui' && support.hasOralSupplement === 'oui') {
    for (const item of support.oralSupplements) {
      const count = Number(item.countPerDay) || 0;
      const values = getOralSupplementNutriments(item.type);
      oralKcal += count * values.kcal;
      oralProt += count * values.prot;
    }
  }

  // 3. Enteral Nutrition (Alimentation entérale)
  let enteralKcal = 0;
  let enteralProt = 0;

  if (support.hasSupport === 'oui' && support.hasEnteral === 'oui') {
    for (const item of support.enteralItems) {
      const volume = Number(item.volumeMl) || 0;
      let kcalPer100 = item.kcalPer100ml;
      let protPer100 = item.proteinPer100ml;

      if (kcalPer100 === undefined || protPer100 === undefined) {
        const found = findNutritionBag(item.bagName, 'enteral');
        if (found) {
          kcalPer100 = found.kcalPer100ml;
          protPer100 = found.proteinPer100ml;
        } else {
          // Standard default enteral bag
          kcalPer100 = 125;
          protPer100 = 5.5;
        }
      }

      enteralKcal += (volume / 100) * kcalPer100;
      enteralProt += (volume / 100) * protPer100;
    }
  }

  // 4. Parenteral Nutrition (Alimentation parentérale)
  let parenteralKcal = 0;
  let parenteralProt = 0;

  if (support.hasSupport === 'oui' && support.hasParenteral === 'oui') {
    for (const item of support.parenteralItems) {
      const volume = Number(item.volumeMl) || 0;
      let kcalPer100 = item.kcalPer100ml;
      let protPer100 = item.proteinPer100ml;

      if (kcalPer100 === undefined || protPer100 === undefined) {
        const found = findNutritionBag(item.bagName, 'parenteral');
        if (found) {
          kcalPer100 = found.kcalPer100ml;
          protPer100 = found.proteinPer100ml;
        } else {
          // Standard default parenteral bag
          kcalPer100 = 100;
          protPer100 = 5.0;
        }
      }

      parenteralKcal += (volume / 100) * kcalPer100;
      parenteralProt += (volume / 100) * protPer100;
    }
  }

  const totalKcal = Math.round(foodKcal + oralKcal + enteralKcal + parenteralKcal);
  const totalProt = Math.round((foodProt + oralProt + enteralProt + parenteralProt) * 10) / 10;

  return {
    foodKcal: Math.round(foodKcal),
    foodProt: Math.round(foodProt * 10) / 10,
    oralKcal: Math.round(oralKcal),
    oralProt: Math.round(oralProt * 10) / 10,
    enteralKcal: Math.round(enteralKcal),
    enteralProt: Math.round(enteralProt * 10) / 10,
    parenteralKcal: Math.round(parenteralKcal),
    parenteralProt: Math.round(parenteralProt * 10) / 10,
    totalKcal,
    totalProt
  };
}

/**
 * Compare intakes against targets and determine status (deficit, adapted, excess)
 */
export function calculateDelta(
  intake: IntakeCalculation,
  target: TargetCalculation
): DeltaCalculation {
  if (target.minKcal === 0 && target.maxKcal === 0) {
    return {
      status: 'adapted',
      kcalDiff: 0,
      protDiff: 0,
      text: 'Renseignez le poids du patient pour calculer les objectifs.'
    };
  }

  const isKcalDeficit = intake.totalKcal < target.minKcal;
  const isProtDeficit = intake.totalProt < target.minProt;

  const isKcalExcess = intake.totalKcal > target.maxKcal;
  const isProtExcess = intake.totalProt > target.maxProt;

  // 1. Deficit condition: If intake < target in kcal OR protein OR both
  if (isKcalDeficit || isProtDeficit) {
    const kcalDeficit = isKcalDeficit ? target.minKcal - intake.totalKcal : 0;
    const protDeficit = isProtDeficit ? Math.round((target.minProt - intake.totalProt) * 10) / 10 : 0;

    let text = `Déficit de ${kcalDeficit > 0 ? `${kcalDeficit} kcal` : '0 kcal'} et ${
      protDeficit > 0 ? `${protDeficit} g` : '0 g'
    } de protéines`;

    return {
      status: 'deficit',
      kcalDiff: -kcalDeficit,
      protDiff: -protDeficit,
      text
    };
  }

  // 2. Excess condition: If intake > max target
  if (isKcalExcess || isProtExcess) {
    const kcalExcess = isKcalExcess ? intake.totalKcal - target.maxKcal : 0;
    const protExcess = isProtExcess ? Math.round((intake.totalProt - target.maxProt) * 10) / 10 : 0;

    let text = `Apports trop importants (+${kcalExcess > 0 ? `${kcalExcess} kcal` : '0 kcal'}, +${
      protExcess > 0 ? `${protExcess} g` : '0 g'
    } protéines)`;

    return {
      status: 'excess',
      kcalDiff: kcalExcess,
      protDiff: protExcess,
      text
    };
  }

  // 3. Within target range (adapted)
  return {
    status: 'adapted',
    kcalDiff: 0,
    protDiff: 0,
    text: 'Apports adaptés'
  };
}

/**
 * Generate SFNCM clinical management recommendation
 */
export function generateSfncmRecommendation(
  intake: IntakeCalculation,
  target: TargetCalculation,
  support: NutritionalSupport,
  treatment: OncologicalTreatment,
  patient: PatientData
): SfncmRecommendation {
  const delta = calculateDelta(intake, target);
  const sefiScore = parseFloat(support.sefi);
  const isSefiLow = !isNaN(sefiScore) && sefiScore < 5;

  const clinicalAlerts: string[] = [];

  // Comorbidities clinical alerts
  if (treatment.cirrhoseAscite) {
    clinicalAlerts.push(
      'Cirrhose avec ascite : Utiliser le poids sec estimé (déduction de l\'ascite) pour le calcul des cibles. Maintenir un apport protéique adéquat (1,2-1,5 g/kg/j) pour prévenir la fonte musculaire, avec surveillance du bilan hépatique.'
    );
  }
  if (treatment.varicesOesophagiennes) {
    clinicalAlerts.push(
      'Varices œsophagiennes : Risque hémorragique en cas de pose de sonde nasogastrique (SNG). Éviter la pose à l\'aveugle en cas de varices de grade élevé non ligaturées. Privilégier une voie parentérale ou avis gastro-entérologique avant sonde.'
    );
  }
  if (treatment.tubeDigestifNonFonctionnel) {
    clinicalAlerts.push(
      'Tube digestif non fonctionnel : Contre-indication absolue à la nutrition entérale par voie digestive. Indication exclusive de nutrition parentérale (NP).'
    );
  }

  // Weight loss alert
  const currentW = parseFloat(patient.poidsActuel);
  const pastW = parseFloat(patient.poids6Mois);
  if (!isNaN(currentW) && !isNaN(pastW) && pastW > 0) {
    const lossPct = ((pastW - currentW) / pastW) * 100;
    if (lossPct >= 10) {
      clinicalAlerts.push(
        `Perte de poids majeure de ${lossPct.toFixed(1)}% sur 6 mois (critère diagnostique de dénutrition sévère selon l'HAS/SFNCM).`
      );
    } else if (lossPct >= 5) {
      clinicalAlerts.push(
        `Perte de poids significative de ${lossPct.toFixed(1)}% sur 6 mois (critère diagnostique de dénutrition modérée selon l'HAS/SFNCM).`
      );
    }
  }

  if (delta.status === 'adapted') {
    return {
      type: 'adapted',
      title: 'Apports nutritionnels conformes aux objectifs de référence',
      details: [
        'Les apports actuels couvrent les besoins énergétiques et protéiques cibles du patient.',
        'Poursuivre la surveillance pondérale hebdomadaire et réévaluer les ingestas à chaque cure ou consultation.',
        'Maintenir les conseils diététiques d\'enrichissement naturel et l\'hydratation orale.'
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
        'Adapter ou espacer les compléments nutritionnels oraux si le patient s\'alimente très bien spontanément.'
      ],
      clinicalAlerts
    };
  }

  // Deficit situation: SFNCM algorithm based on kcal deficit and SEFI
  const kcalDeficit = Math.abs(delta.kcalDiff);

  // If deficit > 750 kcal OR SEFI < 5 -> Artificial Nutrition
  if (kcalDeficit > 750 || isSefiLow) {
    if (treatment.tubeDigestifNonFonctionnel) {
      return {
        type: 'parenteral',
        title: 'Indication de Nutrition Parentérale (NP) exclusive ou complémentaire',
        details: [
          `Déficit énergétique important (${kcalDeficit} kcal/j) ${isSefiLow ? `et score SEFI très bas (${sefiScore}/10)` : ''} associé à un tube digestif non fonctionnel.`,
          'Mise en place d\'une nutrition parentérale sur voie veineuse centrale (PICC Line ou chambre implantable CCI) avec poche tricompartiment adaptée aux besoins azotés et caloriques.',
          'Surveillance hydro-électrolytique (ionogramme sanguin, glycémie, triglycérides, bilan hépatique, phosphorémie pour prévention du syndrome de renutrition inappropriée SRI).',
          'Supplémentation systématique en vitamines (ex: Cernevit) et oligo-éléments (ex: Nutryelt).'
        ],
        clinicalAlerts
      };
    } else {
      return {
        type: 'enteral',
        title: 'Indication de Nutrition Entérale (NE) à domicile ou hospitalière',
        details: [
          `Déficit énergétique sévère (${kcalDeficit} kcal/j > 750 kcal) ${isSefiLow ? `et/ou score SEFI < 5 (${sefiScore}/10)` : ''} avec tube digestif fonctionnel.`,
          'Conformément aux recommandations SFNCM/ESMO, la nutrition entérale par sonde naso-gastrique (SNG en polyuréthane ou silicone) ou gastrostomie percutanée (GPE si durée prévue > 4 semaines) est le traitement de référence de première intention.',
          'Prescription d\'une formule polymérique hypercalorique/hyperprotéinée (1,5 à 2 kcal/mL) en débit continu régulé par pompe de nutrition.',
          'Démarrage progressif par paliers pour prévenir le syndrome de renutrition inappropriée (SRI) avec surveillance du phosphore, potassium et magnésium.'
        ],
        clinicalAlerts
      };
    }
  }

  // Deficit <= 750 kcal AND SEFI >= 5 -> Compléments Nutritionnels Oraux (CNO)
  const suggestedCno: { type: string; count: number; kcalProvided: number; proteinProvided: number }[] = [];

  if (kcalDeficit <= 400) {
    suggestedCno.push({
      type: 'HP/HC lacté ou dessert',
      count: 1,
      kcalProvided: 400,
      proteinProvided: 20
    });
  } else if (kcalDeficit <= 600) {
    suggestedCno.push(
      {
        type: 'HP/HC lacté ou dessert',
        count: 1,
        kcalProvided: 400,
        proteinProvided: 20
      },
      {
        type: 'Jus de fruit hypercalorique ou biscuits HP',
        count: 1,
        kcalProvided: 200,
        proteinProvided: 6
      }
    );
  } else {
    // 600 to 750 kcal deficit
    suggestedCno.push({
      type: 'HP/HC lacté ou dessert',
      count: 2,
      kcalProvided: 800,
      proteinProvided: 40
    });
  }

  const totalCnoKcal = suggestedCno.reduce((sum, item) => sum + item.kcalProvided, 0);
  const totalCnoProt = suggestedCno.reduce((sum, item) => sum + item.proteinProvided, 0);

  return {
    type: 'cno',
    title: 'Proposition de Complémentation Nutritionnelle Orale (CNO)',
    details: [
      `Déficit modéré (${kcalDeficit} kcal/j ≤ 750 kcal) et SEFI ≥ 5 (${!isNaN(sefiScore) ? `${sefiScore}/10` : 'satisfaisant'}).`,
      `Prescription recommandée de Compléments Nutritionnels Oraux (CNO) hypercaloriques et hyperprotéinés (apport théorique : ~${totalCnoKcal} kcal et ~${totalCnoProt} g de protéines par jour).`,
      'Modalités de prise : à consommer à distance des repas principaux (10h, 16h ou au coucher) pour ne pas altérer l\'appétit spontané.',
      'Conseiller de varier les textures (boissons lactées fraîches, crèmes desserts, jus fruités, soupes chaudes) et les arômes pour optimiser l\'observance.',
      'Associer un enrichissement de l\'alimentation traditionnelle (beurre, crème, fromage râpé, poudre de lait, œufs) et un fractionnement des prises alimentaires (5 à 6 prises/jour).'
    ],
    suggestedCno,
    clinicalAlerts
  };
}
