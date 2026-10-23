export interface NutritionBagProduct {
  name: string;
  brand: string;
  category: 'enteral' | 'parenteral';
  kcalPer100ml: number;
  proteinPer100ml: number; // in grams
  defaultVolumes: number[];
  description: string;
}

export const ENTERAL_PRODUCTS: NutritionBagProduct[] = [
  {
    name: 'Fresubin 2 kcal HP Fibre',
    brand: 'Fresenius Kabi',
    category: 'enteral',
    kcalPer100ml: 200,
    proteinPer100ml: 10.0,
    defaultVolumes: [500, 1000],
    description: 'Hypercalorique, hyperprotéiné avec fibres'
  },
  {
    name: 'Fresubin 2 kcal HP',
    brand: 'Fresenius Kabi',
    category: 'enteral',
    kcalPer100ml: 200,
    proteinPer100ml: 10.0,
    defaultVolumes: [500, 1000],
    description: 'Hypercalorique, hyperprotéiné sans fibres'
  },
  {
    name: 'Fresubin Energy Fibre',
    brand: 'Fresenius Kabi',
    category: 'enteral',
    kcalPer100ml: 150,
    proteinPer100ml: 5.6,
    defaultVolumes: [500, 1000],
    description: 'Hypercalorique avec fibres'
  },
  {
    name: 'Fresubin Original Fibre',
    brand: 'Fresenius Kabi',
    category: 'enteral',
    kcalPer100ml: 100,
    proteinPer100ml: 3.8,
    defaultVolumes: [500, 1000],
    description: 'Normocalorique, normoprotéiné'
  },
  {
    name: 'Nutrison Protein Plus',
    brand: 'Nutricia',
    category: 'enteral',
    kcalPer100ml: 125,
    proteinPer100ml: 6.3,
    defaultVolumes: [500, 1000],
    description: 'Hyperprotéiné pour besoins accrus'
  },
  {
    name: 'Nutrison Energy Multi Fibre',
    brand: 'Nutricia',
    category: 'enteral',
    kcalPer100ml: 153,
    proteinPer100ml: 6.0,
    defaultVolumes: [500, 1000],
    description: 'Hypercalorique avec mélange de 6 fibres'
  },
  {
    name: 'Nutrison Standard',
    brand: 'Nutricia',
    category: 'enteral',
    kcalPer100ml: 100,
    proteinPer100ml: 4.0,
    defaultVolumes: [500, 1000],
    description: 'Normocalorique standard'
  },
  {
    name: 'Isosource Energy Fibre',
    brand: 'Nestlé Health Science',
    category: 'enteral',
    kcalPer100ml: 157,
    proteinPer100ml: 6.1,
    defaultVolumes: [500, 1000],
    description: 'Hypercalorique avec fibres IS50'
  },
  {
    name: 'Isosource Protein',
    brand: 'Nestlé Health Science',
    category: 'enteral',
    kcalPer100ml: 130,
    proteinPer100ml: 7.0,
    defaultVolumes: [500, 1000],
    description: 'Hyperprotéiné'
  },
  {
    name: 'Isosource Standard',
    brand: 'Nestlé Health Science',
    category: 'enteral',
    kcalPer100ml: 103,
    proteinPer100ml: 4.1,
    defaultVolumes: [500, 1000],
    description: 'Normocalorique sans fibres'
  },
  {
    name: 'Peptamen AF (Semi-élémentaire)',
    brand: 'Nestlé Health Science',
    category: 'enteral',
    kcalPer100ml: 150,
    proteinPer100ml: 9.4,
    defaultVolumes: [500, 1000],
    description: 'Peptides de lactosérum, troubles digestifs'
  },
  {
    name: 'Peptamen HN',
    brand: 'Nestlé Health Science',
    category: 'enteral',
    kcalPer100ml: 133,
    proteinPer100ml: 6.6,
    defaultVolumes: [500, 1000],
    description: 'Formule semi-élémentaire hyperazotée'
  },
  {
    name: 'Jevity 1.5 kcal',
    brand: 'Abbott',
    category: 'enteral',
    kcalPer100ml: 150,
    proteinPer100ml: 6.4,
    defaultVolumes: [500, 1000],
    description: 'Hypercalorique avec fibres et FOS'
  },
  {
    name: 'Ensure Plus HN',
    brand: 'Abbott',
    category: 'enteral',
    kcalPer100ml: 150,
    proteinPer100ml: 6.3,
    defaultVolumes: [500, 1000],
    description: 'Hypercalorique et hyperprotéiné'
  },
  {
    name: 'Novasource GI Control',
    brand: 'Nestlé Health Science',
    category: 'enteral',
    kcalPer100ml: 110,
    proteinPer100ml: 4.1,
    defaultVolumes: [500, 1000],
    description: 'Enrichi en fibres solubles PHGG (diarrhées)'
  },
  {
    name: 'Nutricomp Energy HP Fibre',
    brand: 'B. Braun',
    category: 'enteral',
    kcalPer100ml: 150,
    proteinPer100ml: 7.5,
    defaultVolumes: [500, 1000],
    description: 'Hypercalorique, haute teneur en protéines'
  }
];

export const PARENTERAL_PRODUCTS: NutritionBagProduct[] = [
  {
    name: 'Olimel N9E (Voie Centrale)',
    brand: 'Baxter',
    category: 'parenteral',
    kcalPer100ml: 107,
    proteinPer100ml: 5.7,
    defaultVolumes: [1000, 1500, 2000],
    description: 'Tricompartiment haute teneur en acides aminés avec électrolytes'
  },
  {
    name: 'Olimel N7E (Voie Centrale)',
    brand: 'Baxter',
    category: 'parenteral',
    kcalPer100ml: 114,
    proteinPer100ml: 4.4,
    defaultVolumes: [1000, 1500, 2000],
    description: 'Tricompartiment standard pour nutrition parentérale centrale'
  },
  {
    name: 'Olimel N12E (Voie Centrale)',
    brand: 'Baxter',
    category: 'parenteral',
    kcalPer100ml: 95,
    proteinPer100ml: 7.6,
    defaultVolumes: [1000, 1500, 2000],
    description: 'Très haute teneur en protéines pour hypercatabolisme'
  },
  {
    name: 'PeriOlimel N4E (Voie Périphérique)',
    brand: 'Baxter',
    category: 'parenteral',
    kcalPer100ml: 70,
    proteinPer100ml: 2.5,
    defaultVolumes: [1000, 1500, 2000, 2500],
    description: 'Osmolarité adaptée voie veineuse périphérique'
  },
  {
    name: 'SmofKabiven (Voie Centrale)',
    brand: 'Fresenius Kabi',
    category: 'parenteral',
    kcalPer100ml: 110,
    proteinPer100ml: 5.1,
    defaultVolumes: [986, 1477, 1970],
    description: 'Émulsion lipidique à 4 huiles (SMOF : soja, TCM, olive, poisson)'
  },
  {
    name: 'SmofKabiven Extra Nitrogen',
    brand: 'Fresenius Kabi',
    category: 'parenteral',
    kcalPer100ml: 110,
    proteinPer100ml: 6.6,
    defaultVolumes: [1012, 1518, 2024],
    description: 'Haute teneur azotée pour patients en stress métabolique'
  },
  {
    name: 'SmofKabiven Peripheral (Voie Périphérique)',
    brand: 'Fresenius Kabi',
    category: 'parenteral',
    kcalPer100ml: 70,
    proteinPer100ml: 3.2,
    defaultVolumes: [1206, 1448, 1904],
    description: 'Pour perfusion sur voie veineuse périphérique'
  },
  {
    name: 'Kabiven (Voie Centrale)',
    brand: 'Fresenius Kabi',
    category: 'parenteral',
    kcalPer100ml: 90,
    proteinPer100ml: 3.3,
    defaultVolumes: [1026, 1540, 2053, 2566],
    description: 'Tricompartiment standard lipides LCT'
  },
  {
    name: 'Nutriflex Omega Plus (Voie Centrale)',
    brand: 'B. Braun',
    category: 'parenteral',
    kcalPer100ml: 120,
    proteinPer100ml: 5.6,
    defaultVolumes: [1250, 1875, 2500],
    description: 'Avec oméga-3 et TCM/LCT'
  },
  {
    name: 'Nutriflex Lipid Peri (Voie Périphérique)',
    brand: 'B. Braun',
    category: 'parenteral',
    kcalPer100ml: 80,
    proteinPer100ml: 3.2,
    defaultVolumes: [1250, 1875, 2500],
    description: 'Poche tricompartiment pour abord périphérique'
  },
  {
    name: 'Clinimix N9G20E (Bicompartiment)',
    brand: 'Baxter',
    category: 'parenteral',
    kcalPer100ml: 52,
    proteinPer100ml: 2.8,
    defaultVolumes: [1000, 1500, 2000],
    description: 'Solution binaire glucose + acides aminés avec électrolytes'
  },
  {
    name: 'Finomel (Voie Centrale)',
    brand: 'Baxter',
    category: 'parenteral',
    kcalPer100ml: 108,
    proteinPer100ml: 5.6,
    defaultVolumes: [1080, 1440, 1820],
    description: 'Tricompartiment avec acides gras oméga-3'
  }
];

export function searchNutritionBags(query: string, category?: 'enteral' | 'parenteral'): NutritionBagProduct[] {
  const list = category === 'enteral' ? ENTERAL_PRODUCTS : category === 'parenteral' ? PARENTERAL_PRODUCTS : [...ENTERAL_PRODUCTS, ...PARENTERAL_PRODUCTS];
  if (!query || query.trim() === '') return list.slice(0, 8);
  const q = query.toLowerCase().trim();
  return list.filter(item => 
    item.name.toLowerCase().includes(q) || 
    item.brand.toLowerCase().includes(q) || 
    item.description.toLowerCase().includes(q)
  );
}

export function findNutritionBag(name: string, category?: 'enteral' | 'parenteral'): NutritionBagProduct | undefined {
  if (!name) return undefined;
  const list = category === 'enteral' ? ENTERAL_PRODUCTS : category === 'parenteral' ? PARENTERAL_PRODUCTS : [...ENTERAL_PRODUCTS, ...PARENTERAL_PRODUCTS];
  const exact = list.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (exact) return exact;
  const partial = list.find(p => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()));
  return partial;
}
