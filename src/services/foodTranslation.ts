import { normalizeText } from '../lib/utils';

/**
 * Lexique français → anglais (sans accents) pour interroger USDA FoodData Central,
 * dont la base n'est indexée qu'en anglais. Les expressions de plusieurs mots
 * sont traduites avant les mots isolés.
 */
const PHRASES: Record<string, string> = {
  'pomme de terre': 'potato',
  'pommes de terre': 'potatoes',
  'haricots verts': 'green beans',
  'haricot vert': 'green beans',
  'petits pois': 'green peas',
  'fromage blanc': 'cottage cheese',
  'creme fraiche': 'sour cream',
  'pain de mie': 'white bread',
  'pain complet': 'whole wheat bread',
  'pain au chocolat': 'chocolate croissant',
  'jus d orange': 'orange juice',
  'jus de pomme': 'apple juice',
  'jus de fruits': 'fruit juice',
  'blanc de poulet': 'chicken breast',
  'steak hache': 'ground beef',
  'viande hachee': 'ground beef',
  'flocons d avoine': 'oats',
  'pate a tartiner': 'chocolate hazelnut spread',
  'huile d olive': 'olive oil',
  'beurre de cacahuete': 'peanut butter',
  'fruits de mer': 'seafood',
  'creme dessert': 'pudding',
  'yaourt nature': 'plain yogurt',
  'lait demi ecreme': 'milk 2%',
  'lait ecreme': 'skim milk',
  'lait entier': 'whole milk',
  'chou fleur': 'cauliflower',
  'pain d epices': 'gingerbread'
};

const WORDS: Record<string, string> = {
  // Féculents, boulangerie
  pain: 'bread', baguette: 'french bread', biscotte: 'rusk', biscottes: 'rusks', riz: 'rice',
  pates: 'pasta', pate: 'pasta', semoule: 'couscous', couscous: 'couscous', quinoa: 'quinoa',
  ble: 'wheat', avoine: 'oats', cereales: 'cereal', muesli: 'muesli', frites: 'french fries',
  puree: 'mashed potatoes', patate: 'potato', lentilles: 'lentils', pois: 'peas',
  haricots: 'beans', crepe: 'crepe', galette: 'pancake', gateau: 'cake', biscuit: 'cookie',
  biscuits: 'cookies', brioche: 'brioche', croissant: 'croissant', madeleine: 'madeleine',
  // Produits laitiers
  lait: 'milk', yaourt: 'yogurt', yaourts: 'yogurt', yogourt: 'yogurt', fromage: 'cheese',
  beurre: 'butter', creme: 'cream', glace: 'ice cream', emmental: 'swiss cheese',
  gruyere: 'gruyere cheese', camembert: 'camembert', brie: 'brie', comte: 'comte cheese',
  // Viandes, poissons, œufs
  poulet: 'chicken', dinde: 'turkey', boeuf: 'beef', veau: 'veal', porc: 'pork', agneau: 'lamb',
  jambon: 'ham', saucisse: 'sausage', saucisson: 'salami', lardons: 'bacon', bacon: 'bacon',
  steak: 'steak', escalope: 'cutlet', roti: 'roast', oeuf: 'egg', oeufs: 'eggs',
  omelette: 'omelet', poisson: 'fish', saumon: 'salmon', thon: 'tuna', cabillaud: 'cod',
  colin: 'pollock', merlu: 'hake', sardine: 'sardine', sardines: 'sardines', crevettes: 'shrimp',
  moules: 'mussels', truite: 'trout',
  // Légumes
  legumes: 'vegetables', legume: 'vegetable', carotte: 'carrot', carottes: 'carrots',
  courgette: 'zucchini', courgettes: 'zucchini', tomate: 'tomato', tomates: 'tomatoes',
  salade: 'salad', laitue: 'lettuce', epinards: 'spinach', brocoli: 'broccoli', brocolis: 'broccoli',
  chou: 'cabbage', concombre: 'cucumber', poivron: 'bell pepper', oignon: 'onion',
  champignons: 'mushrooms', aubergine: 'eggplant', poireau: 'leek', poireaux: 'leeks',
  avocat: 'avocado', mais: 'corn', soupe: 'soup', potage: 'soup', veloute: 'cream soup',
  // Fruits
  fruit: 'fruit', fruits: 'fruits', pomme: 'apple', pommes: 'apples', poire: 'pear',
  banane: 'banana', orange: 'orange', clementine: 'clementine', mandarine: 'tangerine',
  fraise: 'strawberry', fraises: 'strawberries', raisin: 'grapes', peche: 'peach',
  abricot: 'apricot', ananas: 'pineapple', kiwi: 'kiwi', cerise: 'cherry', cerises: 'cherries',
  melon: 'melon', pasteque: 'watermelon', citron: 'lemon', compote: 'applesauce',
  prune: 'plum', pruneaux: 'prunes', datte: 'date', dattes: 'dates', noix: 'walnuts',
  amandes: 'almonds', noisettes: 'hazelnuts', cacahuetes: 'peanuts',
  // Sucré, boissons, divers
  chocolat: 'chocolate', confiture: 'jam', miel: 'honey', sucre: 'sugar', jus: 'juice',
  cafe: 'coffee', the: 'tea', eau: 'water', vin: 'wine', biere: 'beer', soda: 'soda',
  huile: 'oil', mayonnaise: 'mayonnaise', ketchup: 'ketchup', vinaigrette: 'salad dressing',
  pizza: 'pizza', quiche: 'quiche', lasagnes: 'lasagna', sandwich: 'sandwich',
  hamburger: 'hamburger', gratin: 'gratin', flan: 'flan', tarte: 'pie', sorbet: 'sorbet',
  // Qualificatifs
  cuit: 'cooked', cuite: 'cooked', cuits: 'cooked', cuites: 'cooked', cru: 'raw', crue: 'raw',
  crus: 'raw', vapeur: 'steamed', grille: 'grilled', grillee: 'grilled', frit: 'fried',
  frite: 'fried', nature: 'plain', complet: 'whole wheat',
  entier: 'whole', blanc: 'white', noir: 'dark', vert: 'green', rouge: 'red', sec: 'dry',
  secs: 'dried', fume: 'smoked', allege: 'low fat', maison: 'homemade'
};

const STOP_WORDS = new Set([
  'de', 'du', 'des', 'la', 'le', 'les', 'l', 'd', 'au', 'aux', 'a', 'en', 'et', 'avec', 'sans',
  'un', 'une', 'pour', 'sur'
]);

/**
 * Traduit une requête française en anglais pour USDA. Les mots inconnus sont conservés
 * (beaucoup de noms d'aliments sont identiques : brie, quiche, croissant...).
 * Renvoie `null` si aucun mot n'a pu être traduit, la requête d'origine étant alors utilisée.
 */
export function translateFoodQueryToEnglish(query: string): string | null {
  let text = ` ${normalizeText(query).replace(/[^a-z0-9%]+/g, ' ')} `;
  let translated = false;

  for (const [fr, en] of Object.entries(PHRASES)) {
    if (text.includes(` ${fr} `)) {
      text = text.replace(` ${fr} `, ` ${en} `);
      translated = true;
    }
  }

  const words = text
    .trim()
    .split(/\s+/)
    .filter(word => word && !STOP_WORDS.has(word))
    .map(word => {
      const en = WORDS[word];
      if (en) translated = true;
      return en ?? word;
    });

  return translated ? words.join(' ') : null;
}
