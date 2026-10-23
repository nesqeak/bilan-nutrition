/** Arrondi à une décimale. */
export const round1 = (value: number) => Math.round(value * 10) / 10;

/** Nombre positif issu d'un champ texte, ou 0. */
export function toPositiveNumber(value: string | number | ''): number {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

let idCounter = 0;
export const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

/** Supprime les accents et met en minuscules. */
export const normalizeText = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
