export interface CommonFoodItem {
  name: string;
  category: string;
  kcalPer100g: number;
  proteinPer100g: number;
  defaultUnitWeight: number; // in grams for 1 'unité'
  defaultUnitName: string;
  synonyms?: string[];
}

export const COMMON_FRENCH_FOODS: CommonFoodItem[] = [
  // Petit déjeuner / Féculents / Boulangerie
  { name: 'Pain blanc / Baguette', category: 'Féculents', kcalPer100g: 270, proteinPer100g: 8.5, defaultUnitWeight: 50, defaultUnitName: '1 morceau (50g)', synonyms: ['pain', 'baguette'] },
  { name: 'Pain complet', category: 'Féculents', kcalPer100g: 245, proteinPer100g: 9.0, defaultUnitWeight: 40, defaultUnitName: '1 tranche (40g)', synonyms: ['pain de mie complet'] },
  { name: 'Pain de mie', category: 'Féculents', kcalPer100g: 265, proteinPer100g: 8.0, defaultUnitWeight: 35, defaultUnitName: '1 tranche (35g)' },
  { name: 'Croissant au beurre', category: 'Viennoiserie', kcalPer100g: 410, proteinPer100g: 8.2, defaultUnitWeight: 60, defaultUnitName: '1 croissant (60g)', synonyms: ['croissant'] },
  { name: 'Pain au chocolat', category: 'Viennoiserie', kcalPer100g: 420, proteinPer100g: 7.5, defaultUnitWeight: 70, defaultUnitName: '1 pain au chocolat (70g)', synonyms: ['chocolatine'] },
  { name: 'Biscottes', category: 'Boulangerie', kcalPer100g: 390, proteinPer100g: 11.0, defaultUnitWeight: 10, defaultUnitName: '1 biscotte (10g)' },
  { name: 'Céréales muesli / flocons d\'avoine', category: 'Céréales', kcalPer100g: 375, proteinPer100g: 12.0, defaultUnitWeight: 40, defaultUnitName: '1 portion (40g)', synonyms: ['muesli', 'flocons avoine', 'porridge'] },
  { name: 'Beurre doux / demi-sel', category: 'Matières grasses', kcalPer100g: 745, proteinPer100g: 0.8, defaultUnitWeight: 10, defaultUnitName: '1 noisette / portion (10g)', synonyms: ['beurre'] },
  { name: 'Confiture / Miel', category: 'Sucres', kcalPer100g: 260, proteinPer100g: 0.5, defaultUnitWeight: 20, defaultUnitName: '1 cuillère (20g)', synonyms: ['confiture', 'miel', 'gelée'] },
  { name: 'Pâte à tartiner chocolat noisette', category: 'Sucres', kcalPer100g: 540, proteinPer100g: 6.0, defaultUnitWeight: 20, defaultUnitName: '1 cuillère (20g)', synonyms: ['nutella', 'pâte à tartiner'] },

  // Produits laitiers
  { name: 'Lait demi-écrémé', category: 'Laitages', kcalPer100g: 46, proteinPer100g: 3.3, defaultUnitWeight: 200, defaultUnitName: '1 verre (200mL)', synonyms: ['lait'] },
  { name: 'Lait entier', category: 'Laitages', kcalPer100g: 64, proteinPer100g: 3.2, defaultUnitWeight: 200, defaultUnitName: '1 verre (200mL)' },
  { name: 'Yaourt nature au lait entier', category: 'Laitages', kcalPer100g: 65, proteinPer100g: 4.0, defaultUnitWeight: 125, defaultUnitName: '1 pot (125g)', synonyms: ['yaourt', 'yaourt nature', 'yogourt'] },
  { name: 'Yaourt aux fruits sucré', category: 'Laitages', kcalPer100g: 95, proteinPer100g: 3.5, defaultUnitWeight: 125, defaultUnitName: '1 pot (125g)', synonyms: ['yaourt fruits'] },
  { name: 'Fromage blanc 3.2% MG', category: 'Laitages', kcalPer100g: 75, proteinPer100g: 7.5, defaultUnitWeight: 100, defaultUnitName: '1 ramequin (100g)', synonyms: ['fromage blanc'] },
  { name: 'Petit-suisse (2x60g)', category: 'Laitages', kcalPer100g: 140, proteinPer100g: 9.5, defaultUnitWeight: 60, defaultUnitName: '1 petit-suisse (60g)' },
  { name: 'Emmental / Fromage râpé', category: 'Fromages', kcalPer100g: 380, proteinPer100g: 28.0, defaultUnitWeight: 30, defaultUnitName: '1 portion (30g)', synonyms: ['gruyère', 'emmental', 'fromage râpé'] },
  { name: 'Camembert / Brie', category: 'Fromages', kcalPer100g: 290, proteinPer100g: 21.0, defaultUnitWeight: 30, defaultUnitName: '1 portion (30g)', synonyms: ['camembert', 'brie'] },
  { name: 'Comté', category: 'Fromages', kcalPer100g: 415, proteinPer100g: 27.0, defaultUnitWeight: 30, defaultUnitName: '1 portion (30g)', synonyms: ['comté'] },
  { name: 'Crème fraîche épaisse 30%', category: 'Laitages', kcalPer100g: 295, proteinPer100g: 2.4, defaultUnitWeight: 30, defaultUnitName: '1 cuillère à soupe (30g)', synonyms: ['crème', 'crème fraîche'] },

  // Viandes, Poissons, Œufs (VPO)
  { name: 'Blanc de poulet cuit', category: 'Viandes', kcalPer100g: 165, proteinPer100g: 31.0, defaultUnitWeight: 120, defaultUnitName: '1 filet (120g)', synonyms: ['poulet', 'blanc de poulet', 'escalope de dinde'] },
  { name: 'Steak haché de bœuf cuit 15% MG', category: 'Viandes', kcalPer100g: 215, proteinPer100g: 26.0, defaultUnitWeight: 100, defaultUnitName: '1 steak (100g)', synonyms: ['steak haché', 'bœuf', 'viande hachée'] },
  { name: 'Jambon blanc cuit supérieur', category: 'Charcuterie', kcalPer100g: 120, proteinPer100g: 21.0, defaultUnitWeight: 45, defaultUnitName: '1 tranche (45g)', synonyms: ['jambon', 'jambon blanc', 'jambon de Paris'] },
  { name: 'Œuf de poule entier cuit', category: 'Œufs', kcalPer100g: 145, proteinPer100g: 13.0, defaultUnitWeight: 50, defaultUnitName: '1 œuf moyen (50g)', synonyms: ['oeuf', 'œuf', 'omelette', 'oeuf dur'] },
  { name: 'Saumon cuit au four', category: 'Poissons', kcalPer100g: 205, proteinPer100g: 22.0, defaultUnitWeight: 120, defaultUnitName: '1 pavé (120g)', synonyms: ['saumon', 'pavé de saumon'] },
  { name: 'Cabillaud / Poisson blanc cuit', category: 'Poissons', kcalPer100g: 90, proteinPer100g: 19.5, defaultUnitWeight: 120, defaultUnitName: '1 filet (120g)', synonyms: ['cabillaud', 'colin', 'merlu', 'poisson blanc'] },
  { name: 'Thon au naturel égoutté', category: 'Poissons', kcalPer100g: 110, proteinPer100g: 25.0, defaultUnitWeight: 100, defaultUnitName: '1 boîte (100g)', synonyms: ['thon', 'thon en boîte'] },
  { name: 'Rôti de porc cuit', category: 'Viandes', kcalPer100g: 180, proteinPer100g: 28.0, defaultUnitWeight: 100, defaultUnitName: '1 tranche (100g)', synonyms: ['porc', 'rôti de porc'] },

  // Féculents et Légumineuses
  { name: 'Pâtes cuites nature', category: 'Féculents', kcalPer100g: 130, proteinPer100g: 4.5, defaultUnitWeight: 200, defaultUnitName: '1 assiette (200g)', synonyms: ['pâtes', 'spaghetti', 'coquillettes', 'macaroni'] },
  { name: 'Riz blanc cuit', category: 'Féculents', kcalPer100g: 130, proteinPer100g: 2.7, defaultUnitWeight: 200, defaultUnitName: '1 assiette (200g)', synonyms: ['riz', 'riz blanc', 'riz basmati'] },
  { name: 'Purée de pommes de terre au lait et beurre', category: 'Féculents', kcalPer100g: 110, proteinPer100g: 2.2, defaultUnitWeight: 200, defaultUnitName: '1 assiette (200g)', synonyms: ['purée', 'purée mousseline'] },
  { name: 'Pommes de terre cuites vapeur', category: 'Féculents', kcalPer100g: 85, proteinPer100g: 2.0, defaultUnitWeight: 150, defaultUnitName: '2 pommes de terre (150g)', synonyms: ['pomme de terre', 'patate'] },
  { name: 'Frites', category: 'Féculents', kcalPer100g: 280, proteinPer100g: 3.5, defaultUnitWeight: 150, defaultUnitName: '1 portion (150g)', synonyms: ['frites'] },
  { name: 'Lentilles cuites', category: 'Légumineuses', kcalPer100g: 115, proteinPer100g: 8.5, defaultUnitWeight: 200, defaultUnitName: '1 assiette (200g)', synonyms: ['lentilles'] },
  { name: 'Quinoa cuit', category: 'Féculents', kcalPer100g: 120, proteinPer100g: 4.4, defaultUnitWeight: 180, defaultUnitName: '1 assiette (180g)', synonyms: ['quinoa'] },
  { name: 'Semoule de couscous cuite', category: 'Féculents', kcalPer100g: 135, proteinPer100g: 4.0, defaultUnitWeight: 200, defaultUnitName: '1 assiette (200g)', synonyms: ['semoule', 'couscous'] },

  // Légumes et Soupes
  { name: 'Haricots verts cuits', category: 'Légumes', kcalPer100g: 30, proteinPer100g: 1.8, defaultUnitWeight: 150, defaultUnitName: '1 portion (150g)', synonyms: ['haricots verts', 'haricot vert'] },
  { name: 'Carottes cuites', category: 'Légumes', kcalPer100g: 35, proteinPer100g: 0.8, defaultUnitWeight: 150, defaultUnitName: '1 portion (150g)', synonyms: ['carotte', 'carottes'] },
  { name: 'Courgettes cuites', category: 'Légumes', kcalPer100g: 20, proteinPer100g: 1.2, defaultUnitWeight: 150, defaultUnitName: '1 portion (150g)', synonyms: ['courgette', 'courgettes'] },
  { name: 'Salade verte assaisonnée', category: 'Légumes', kcalPer100g: 75, proteinPer100g: 1.2, defaultUnitWeight: 80, defaultUnitName: '1 petit bol (80g)', synonyms: ['salade', 'salade verte', 'laitue'] },
  { name: 'Tomates', category: 'Légumes', kcalPer100g: 20, proteinPer100g: 0.9, defaultUnitWeight: 120, defaultUnitName: '1 tomate (120g)', synonyms: ['tomate'] },
  { name: 'Soupe / Velouté de légumes maison', category: 'Soupes', kcalPer100g: 40, proteinPer100g: 1.0, defaultUnitWeight: 250, defaultUnitName: '1 bol (250mL)', synonyms: ['soupe de légumes', 'potage', 'velouté'] },
  { name: 'Soupe de légumes enrichie (crème/fromage)', category: 'Soupes', kcalPer100g: 80, proteinPer100g: 2.5, defaultUnitWeight: 250, defaultUnitName: '1 bol (250mL)', synonyms: ['soupe enrichie'] },

  // Fruits et Desserts
  { name: 'Pomme', category: 'Fruits', kcalPer100g: 52, proteinPer100g: 0.3, defaultUnitWeight: 150, defaultUnitName: '1 pomme moyenne (150g)', synonyms: ['pomme'] },
  { name: 'Banane', category: 'Fruits', kcalPer100g: 90, proteinPer100g: 1.1, defaultUnitWeight: 120, defaultUnitName: '1 banane moyenne (120g)', synonyms: ['banane'] },
  { name: 'Compote de pommes allégée / classique', category: 'Desserts', kcalPer100g: 75, proteinPer100g: 0.4, defaultUnitWeight: 100, defaultUnitName: '1 coupelle (100g)', synonyms: ['compote', 'compote de pomme'] },
  { name: 'Orange / Clémentines', category: 'Fruits', kcalPer100g: 45, proteinPer100g: 0.8, defaultUnitWeight: 130, defaultUnitName: '1 orange (130g)', synonyms: ['orange', 'clémentine', 'mandarine'] },
  { name: 'Jus d\'orange pur jus', category: 'Boissons', kcalPer100g: 45, proteinPer100g: 0.7, defaultUnitWeight: 150, defaultUnitName: '1 verre (150mL)', synonyms: ['jus d\'orange', 'jus de fruits', 'jus pomme'] },
  { name: 'Crème dessert chocolat / vanille', category: 'Desserts', kcalPer100g: 130, proteinPer100g: 3.5, defaultUnitWeight: 125, defaultUnitName: '1 pot (125g)', synonyms: ['danette', 'crème dessert', 'flan'] },
  { name: 'Glace / Sorbet', category: 'Desserts', kcalPer100g: 180, proteinPer100g: 3.0, defaultUnitWeight: 80, defaultUnitName: '2 boules (80g)', synonyms: ['glace', 'sorbet'] },
  { name: 'Biscuits / Cookies / Madeleines', category: 'Biscuiterie', kcalPer100g: 460, proteinPer100g: 6.5, defaultUnitWeight: 25, defaultUnitName: '1 biscuit/madeleine (25g)', synonyms: ['biscuit', 'gâteau', 'madeleine', 'sablé'] },
  { name: 'Chocolat noir / au lait', category: 'Confiserie', kcalPer100g: 535, proteinPer100g: 6.0, defaultUnitWeight: 10, defaultUnitName: '1 carré (10g)', synonyms: ['chocolat'] },

  // Plats cuisinés courants
  { name: 'Lasagnes à la bolognaise', category: 'Plats composés', kcalPer100g: 145, proteinPer100g: 7.2, defaultUnitWeight: 300, defaultUnitName: '1 portion (300g)', synonyms: ['lasagnes'] },
  { name: 'Hachis parmentier', category: 'Plats composés', kcalPer100g: 130, proteinPer100g: 6.5, defaultUnitWeight: 300, defaultUnitName: '1 portion (300g)', synonyms: ['parmentier'] },
  { name: 'Quiche lorraine', category: 'Plats composés', kcalPer100g: 270, proteinPer100g: 9.0, defaultUnitWeight: 150, defaultUnitName: '1 part (150g)', synonyms: ['quiche', 'tarte salée'] },
  { name: 'Pizza', category: 'Plats composés', kcalPer100g: 250, proteinPer100g: 10.0, defaultUnitWeight: 150, defaultUnitName: '1 part (150g)', synonyms: ['pizza'] },
  { name: 'Gratin dauphinois', category: 'Plats composés', kcalPer100g: 160, proteinPer100g: 3.8, defaultUnitWeight: 200, defaultUnitName: '1 portion (200g)', synonyms: ['gratin'] },
  { name: 'Sandwich jambon beurre', category: 'Plats composés', kcalPer100g: 270, proteinPer100g: 10.5, defaultUnitWeight: 200, defaultUnitName: '1 sandwich (200g)', synonyms: ['sandwich'] }
];

export function searchCommonFoods(query: string): CommonFoodItem[] {
  if (!query || query.trim() === '') return COMMON_FRENCH_FOODS.slice(0, 10);
  const q = query.toLowerCase().trim();
  return COMMON_FRENCH_FOODS.filter(item => {
    if (item.name.toLowerCase().includes(q)) return true;
    if (item.category.toLowerCase().includes(q)) return true;
    if (item.synonyms && item.synonyms.some(s => s.toLowerCase().includes(q))) return true;
    return false;
  });
}
