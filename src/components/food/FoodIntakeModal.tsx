import { Apple, ArrowLeft, CheckCircle2, Coffee, Flame, Info, Loader2, Moon, Plus, Sun, Utensils, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import { MEALS } from '../../data/referenceValues';
import { computeFoodItemNutrients, filledFoodItems, needsNutritionLookup, sumNutrients } from '../../lib/clinical';
import { createId, round1 } from '../../lib/utils';
import { FoodIntakeRecord, FoodItemEntry, MealType } from '../../types';
import { Modal } from '../ui/Modal';
import { FoodLine } from './FoodLine';

interface FoodIntakeModalProps {
  foodRecord: FoodIntakeRecord;
  onSave: (record: FoodIntakeRecord) => void;
  onClose: () => void;
}

const MEAL_ICONS: Record<MealType, typeof Coffee> = {
  petitDejeuner: Coffee,
  collationMatin: Apple,
  dejeuner: Sun,
  gouter: Apple,
  diner: Utensils,
  collationSoir: Moon
};

function NutrientTotals({ kcal, prot }: { kcal: number; prot: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-emerald-700 flex items-center font-bold">
        <Flame className="w-3.5 h-3.5 mr-0.5 text-amber-500" />
        {kcal} kcal
      </span>
      <span className="text-slate-300">•</span>
      <span className="text-indigo-700 flex items-center font-bold">
        <Zap className="w-3.5 h-3.5 mr-0.5 text-indigo-500" />
        {round1(prot)} g prot
      </span>
    </span>
  );
}

export function FoodIntakeModal({ foodRecord, onSave, onClose }: FoodIntakeModalProps) {
  const [meals, setMeals] = useState(foodRecord.meals);

  /** Applique une modification à la ligne `id`, quel que soit son repas. */
  const updateItem = useCallback((id: string, updates: Partial<FoodItemEntry>) => {
    setMeals(prev => {
      const next = { ...prev };
      for (const meal of MEALS) {
        if (prev[meal.key].some(item => item.id === id)) {
          next[meal.key] = prev[meal.key].map(item => (item.id === id ? { ...item, ...updates } : item));
        }
      }
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setMeals(prev => {
      const next = { ...prev };
      for (const meal of MEALS) next[meal.key] = prev[meal.key].filter(item => item.id !== id);
      return next;
    });
  }, []);

  const addItem = (meal: MealType) =>
    setMeals(prev => ({
      ...prev,
      [meal]: [...prev[meal], { id: createId('food'), name: '', quantity: 1, unit: 'unité' }]
    }));

  const draft: FoodIntakeRecord = { meals, isValidated: true };
  const items = filledFoodItems(draft);
  const total = sumNutrients(items.map(computeFoodItemNutrients));
  const pendingCount = items.filter(needsNutritionLookup).length;
  const missingValuesCount = items.filter(item => item.nutrition?.source === 'notFound').length;

  return (
    <Modal title="Relevé alimentaire quotidien" onClose={onClose} className="max-w-4xl bg-slate-50">
      <div className="flex flex-col max-h-[92vh]">
        {/* En-tête */}
        <div className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Retourner à l'écran principal"
              aria-label="Retourner à l'écran principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">Relevé alimentaire quotidien</h2>
              <p className="text-xs text-slate-500">
                Équivalences : 1 càc = 5 mL, 1 bol = 250 mL, 1 assiette = 250 g
              </p>
            </div>
          </div>
          <div className="hidden sm:block bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-right text-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total estimé</span>
            <NutrientTotals {...total} />
          </div>
        </div>

        {/* Repas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold">Recherche nutritionnelle en texte libre : </span>
              les valeurs sont recherchées sur <strong>OpenFoodFacts</strong>. Si l'aliment n'y figure pas, un lien
              ouvre une <strong>recherche Google</strong> et les calories et protéines pour 100 g sont à saisir
              sur la ligne. Un aliment choisi dans la liste de suggestions utilise directement les valeurs de la base
              locale.
            </p>
          </div>

          {MEALS.map(meal => {
            const mealItems = meals[meal.key];
            const subtotal = sumNutrients(mealItems.map(computeFoodItemNutrients));
            const Icon = MEAL_ICONS[meal.key];

            return (
              <section key={meal.key} aria-label={meal.label} className="bg-white rounded-xl border border-slate-200/90 shadow-xs">
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-2 rounded-t-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-200">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{meal.label}</h3>
                      <span className="text-[11px] text-slate-400">{meal.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {mealItems.length > 0 && (
                      <span className="hidden sm:inline text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        <span className="text-emerald-700 font-bold">{subtotal.kcal}</span> kcal /{' '}
                        <span className="text-indigo-700 font-bold">{round1(subtotal.prot)}</span> g prot
                      </span>
                    )}
                    <button
                      type="button"
                      id={`add-food-${meal.key}`}
                      onClick={() => addItem(meal.key)}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Ajouter
                    </button>
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-2.5">
                  {mealItems.length === 0 ? (
                    <p className="text-center py-1 text-xs text-slate-400 italic">Aucun aliment renseigné pour ce repas.</p>
                  ) : (
                    mealItems.map((item, idx) => (
                      <FoodLine
                        key={item.id}
                        item={item}
                        inputId={`food-${meal.key}-${idx}`}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Pied */}
        <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span className="font-semibold text-slate-700">{items.length}</span> aliment(s) renseigné(s) • Total :{' '}
            <NutrientTotals {...total} />
            {missingValuesCount > 0 && (
              <span className="block text-amber-700 font-semibold mt-0.5">
                {missingValuesCount} aliment(s) sans valeurs, non comptés : à compléter après recherche Google
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              id="validate-food-intake-button"
              type="button"
              disabled={pendingCount > 0}
              onClick={() => onSave(draft)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {pendingCount > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Recherche en cours…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Valider le relevé
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
