import { ExternalLink, Loader2, SearchX } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { CommonFoodItem, searchCommonFoods } from '../../data/commonFoods';
import { FOOD_UNITS } from '../../data/referenceValues';
import { computeFoodItemNutrients, needsNutritionLookup } from '../../lib/clinical';
import { googleNutritionSearchUrl, lookupFoodNutrition, nutritionFromCommonFood } from '../../services/foodLookup';
import { FoodItemEntry, FoodNutrition, FoodSource, FoodUnit } from '../../types';
import { AutocompleteInput } from '../ui/AutocompleteInput';
import { DeleteButton, INPUT_CLASS } from '../ui/controls';

/** Délai après la dernière frappe avant d'interroger OpenFoodFacts. */
const LOOKUP_DEBOUNCE_MS = 700;

const MOBILE_LABEL = 'text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 sm:hidden';

const SOURCE_BADGES: Record<FoodSource, { label: string; title: string; className: string }> = {
  openfoodfacts: {
    label: 'OFF',
    title: 'OpenFoodFacts',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  database: { label: 'Base locale', title: 'Base locale', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  manual: { label: 'Saisie manuelle', title: 'Valeurs saisies', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  notFound: {
    label: 'À compléter',
    title: 'Introuvable sur OpenFoodFacts : valeurs à saisir',
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

  const nutrition = item.nutrition;
  const needsManualValues =
    !isSearching && !!nutrition && (nutrition.source === 'notFound' || nutrition.source === 'manual');

  return (
    <div className="p-2.5 bg-slate-50/70 hover:bg-slate-50 rounded-lg border border-slate-200 text-sm transition-colors space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
            onChange={e =>
              onUpdate(item.id, { quantity: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })
            }
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
            ) : item.nutrition && item.nutrition.source !== 'notFound' ? (
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
            <div
              className="text-[9px] text-right mt-0.5 truncate"
              title={`${badge.title} : ${item.nutrition.productName}`}
            >
              <span className={`inline-block px-1.5 rounded border font-medium ${badge.className}`}>{badge.label}</span>
            </div>
          )}
        </div>

        <div className="self-end sm:self-center">
          <DeleteButton label="Supprimer cet aliment" onClick={() => onRemove(item.id)} />
        </div>
      </div>
      {needsManualValues && nutrition && (
        <ManualValues
          key={nutrition.query}
          inputId={inputId}
          foodName={query}
          nutrition={nutrition}
          onChange={values => onUpdate(item.id, { nutrition: { ...nutrition, ...values, source: 'manual' } })}
        />
      )}
    </div>
  );
}

const MANUAL_INPUT_CLASS =
  'w-20 px-2 py-1.5 text-sm text-center font-semibold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500';

interface ManualValuesProps {
  inputId: string;
  foodName: string;
  nutrition: FoodNutrition;
  onChange: (values: Pick<FoodNutrition, 'kcalPer100g' | 'proteinPer100g'>) => void;
}

/** Aliment absent d'OpenFoodFacts : lien de recherche Google et saisie des valeurs pour 100 g. */
function ManualValues({ inputId, foodName, nutrition, onChange }: ManualValuesProps) {
  const isManual = nutrition.source === 'manual';
  const kcalRef = useRef<HTMLInputElement>(null);
  const protRef = useRef<HTMLInputElement>(null);
  const kcalId = `${inputId}-kcal100`;

  const read = (input: HTMLInputElement | null) => {
    const value = parseFloat(input?.value ?? '');
    return Number.isFinite(value) && value >= 0 ? value : 0;
  };
  const update = () => onChange({ kcalPer100g: read(kcalRef.current), proteinPer100g: read(protRef.current) });

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 px-3 py-2 rounded-md bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
      <div className="flex items-center gap-1.5 flex-1">
        <SearchX className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Introuvable sur OpenFoodFacts.</span>
        <a
          href={googleNutritionSearchUrl(foodName)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-blue-700 underline hover:text-blue-900"
        >
          Rechercher sur Google
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={kcalId} className="font-medium">
          Pour 100 g :
        </label>
        <input
          id={kcalId}
          ref={kcalRef}
          type="number"
          min={0}
          step="any"
          placeholder="kcal"
          aria-label="Calories pour 100 g"
          defaultValue={isManual ? nutrition.kcalPer100g : ''}
          onChange={update}
          className={MANUAL_INPUT_CLASS}
        />
        <span>kcal</span>
        <input
          ref={protRef}
          type="number"
          min={0}
          step="any"
          placeholder="prot."
          aria-label="Protéines pour 100 g"
          defaultValue={isManual ? nutrition.proteinPer100g : ''}
          onChange={update}
          className={MANUAL_INPUT_CLASS}
        />
        <span>g de protéines</span>
      </div>
    </div>
  );
}
