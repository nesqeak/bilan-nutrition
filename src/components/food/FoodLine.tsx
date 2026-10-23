import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { CommonFoodItem, searchCommonFoods } from '../../data/commonFoods';
import { FOOD_UNITS } from '../../data/referenceValues';
import { computeFoodItemNutrients, needsNutritionLookup } from '../../lib/clinical';
import { lookupFoodNutrition, nutritionFromCommonFood } from '../../services/foodLookup';
import { FoodItemEntry, FoodSource, FoodUnit } from '../../types';
import { AutocompleteInput } from '../ui/AutocompleteInput';
import { DeleteButton, INPUT_CLASS } from '../ui/controls';

/** Délai après la dernière frappe avant d'interroger OpenFoodFacts / USDA. */
const LOOKUP_DEBOUNCE_MS = 700;

const MOBILE_LABEL = 'text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 sm:hidden';

const SOURCE_BADGES: Record<FoodSource, { label: string; title: string; className: string }> = {
  openfoodfacts: { label: 'OFF', title: 'OpenFoodFacts', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  usda: { label: 'USDA FDC', title: 'USDA FoodData Central (fdc.nal.usda.gov)', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  database: { label: 'Base locale', title: 'Base locale', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  estimate: {
    label: 'Estimation',
    title: 'Aliment introuvable : estimation générique (120 kcal / 4,5 g de protéines pour 100 g)',
    className: 'bg-amber-50 text-amber-700 border-amber-200'
  }
};

interface FoodLineProps {
  item: FoodItemEntry;
  inputId: string;
  onUpdate: (id: string, updates: Partial<FoodItemEntry>) => void;
  onRemove: (id: string) => void;
}

export function FoodLine({ item, inputId, onUpdate, onRemove }: FoodLineProps) {
  const query = item.name.trim();
  const isSearching = needsNutritionLookup(item);

  useEffect(() => {
    if (!isSearching) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      lookupFoodNutrition(query).then(nutrition => {
        if (!cancelled) onUpdate(item.id, { nutrition });
      });
    }, LOOKUP_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [item.id, query, isSearching, onUpdate]);

  const { kcal, prot } = computeFoodItemNutrients(item);
  const badge = item.nutrition && !isSearching ? SOURCE_BADGES[item.nutrition.source] : null;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-slate-50/70 hover:bg-slate-50 rounded-lg border border-slate-200 text-sm transition-colors">
      <div className="flex-1">
        <label htmlFor={inputId} className={MOBILE_LABEL}>
          Aliment
        </label>
        <AutocompleteInput<CommonFoodItem>
          id={inputId}
          value={item.name}
          placeholder="Nom de l'aliment (ex: Yaourt nature, Pain, Saumon...)"
          onChange={name => onUpdate(item.id, { name })}
          onSelect={food => onUpdate(item.id, { name: food.name, nutrition: nutritionFromCommonFood(food) })}
          getSuggestions={searchCommonFoods}
          getKey={food => food.name}
          adornment={isSearching ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : undefined}
          renderSuggestion={food => (
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-900">{food.name}</div>
                <div className="text-[11px] text-slate-500">
                  {food.category} • 1 unité ≈ {food.defaultUnitName}
                </div>
              </div>
              <div className="text-right text-xs whitespace-nowrap">
                <span className="text-emerald-700 font-bold">{food.kcalPer100g} kcal</span>
                <span className="text-slate-400"> /100g</span>
              </div>
            </div>
          )}
        />
      </div>

      <div className="w-full sm:w-24">
        <label htmlFor={`${inputId}-qty`} className={MOBILE_LABEL}>
          Quantité
        </label>
        <input
          id={`${inputId}-qty`}
          type="number"
          step={0.25}
          min={0}
          placeholder="1"
          value={item.quantity}
          onChange={e => onUpdate(item.id, { quantity: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })}
          className={`${INPUT_CLASS} text-center font-semibold`}
        />
      </div>

      <div className="w-full sm:w-40">
        <label htmlFor={`${inputId}-unit`} className={MOBILE_LABEL}>
          Unité
        </label>
        <select
          id={`${inputId}-unit`}
          value={item.unit}
          onChange={e => onUpdate(item.id, { unit: e.target.value as FoodUnit })}
          className={INPUT_CLASS}
        >
          {FOOD_UNITS.map(unit => (
            <option key={unit.value} value={unit.value}>
              {unit.value}
              {unit.hint ? ` (${unit.hint})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-40 flex flex-col justify-center px-2 py-1 bg-white rounded-md border border-slate-200 text-xs min-h-9">
        <div className="flex items-center justify-between sm:justify-end">
          <span className="text-slate-400 sm:hidden">Valeurs :</span>
          {isSearching ? (
            <span className="text-slate-400 italic text-[11px]">Recherche…</span>
          ) : item.nutrition ? (
            <span className="font-semibold text-slate-700">
              <span className="text-emerald-700 font-bold">{kcal}</span> kcal
              <span className="text-slate-300 mx-1">|</span>
              <span className="text-indigo-700 font-bold">{prot}</span> g
            </span>
          ) : (
            <span className="text-slate-400 italic text-[11px]">—</span>
          )}
        </div>
        {badge && item.nutrition && (
          <div className="text-[9px] text-right mt-0.5 truncate" title={`${badge.title} : ${item.nutrition.productName}`}>
            <span className={`inline-block px-1.5 rounded border font-medium ${badge.className}`}>{badge.label}</span>
          </div>
        )}
      </div>

      <div className="self-end sm:self-center">
        <DeleteButton label="Supprimer cet aliment" onClick={() => onRemove(item.id)} />
      </div>
    </div>
  );
}
