import React, { useState } from 'react';
import {
  FoodIntakeRecord,
  FoodItemEntry,
  FoodUnit,
  MealType
} from '../types';
import { AutocompleteInput } from './AutocompleteInput';
import { lookupFoodNutrition, convertToGramsOrMl } from '../services/nutritionService';
import { searchCommonFoods, CommonFoodItem } from '../data/commonFoods';
import {
  Utensils,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Coffee,
  Sun,
  Apple,
  Moon,
  Sparkles,
  Flame,
  Zap,
  Info
} from 'lucide-react';

interface FoodIntakeModalProps {
  foodRecord: FoodIntakeRecord;
  onSave: (record: FoodIntakeRecord) => void;
  onClose: () => void;
}

interface MealSectionConfig {
  key: MealType;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const MEAL_SECTIONS: MealSectionConfig[] = [
  {
    key: 'petitDejeuner',
    label: 'Petit déjeuner',
    subLabel: 'Matinée',
    icon: Coffee,
    color: 'amber'
  },
  {
    key: 'collationMatin',
    label: 'Collation du matin',
    subLabel: '10h - 11h',
    icon: Apple,
    color: 'emerald'
  },
  {
    key: 'dejeuner',
    label: 'Déjeuner',
    subLabel: 'Midi',
    icon: Sun,
    color: 'orange'
  },
  {
    key: 'gouter',
    label: 'Goûter',
    subLabel: '16h - 17h',
    icon: Apple,
    color: 'teal'
  },
  {
    key: 'diner',
    label: 'Dîner',
    subLabel: 'Soir',
    icon: Utensils,
    color: 'indigo'
  },
  {
    key: 'collationSoir',
    label: 'Collation du soir',
    subLabel: 'Coucher / Nuit',
    icon: Moon,
    color: 'purple'
  }
];

const UNITS: FoodUnit[] = ['unité', 'cuillère à café', 'bol', 'mL', 'assiette'];

export const FoodIntakeModal: React.FC<FoodIntakeModalProps> = ({
  foodRecord,
  onSave,
  onClose
}) => {
  const [record, setRecord] = useState<FoodIntakeRecord>(JSON.parse(JSON.stringify(foodRecord)));

  // Add line to meal
  const addLine = (meal: MealType) => {
    const newEntry: FoodItemEntry = {
      id: 'food-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: '',
      quantity: 1,
      unit: 'unité',
      calories: 0,
      proteins: 0
    };
    setRecord(prev => ({
      ...prev,
      [meal]: [...prev[meal], newEntry]
    }));
  };

  // Remove line from meal
  const removeLine = (meal: MealType, id: string) => {
    setRecord(prev => ({
      ...prev,
      [meal]: prev[meal].filter(item => item.id !== id)
    }));
  };

  // Update line and trigger recalculation
  const updateLine = async (meal: MealType, id: string, updates: Partial<FoodItemEntry>) => {
    // Immediate state update
    setRecord(prev => {
      const updatedMeal = prev[meal].map(item => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updates };
        return merged;
      });
      return { ...prev, [meal]: updatedMeal };
    });

    // If name, quantity, or unit changed, re-fetch nutritional data
    const currentMealList = record[meal];
    const currentItem = currentMealList.find(i => i.id === id);
    if (!currentItem) return;

    const newName = updates.name !== undefined ? updates.name : currentItem.name;
    const newQty = updates.quantity !== undefined ? updates.quantity : currentItem.quantity;
    const newUnit = updates.unit !== undefined ? updates.unit : currentItem.unit;

    if (newName && newName.trim().length > 1) {
      try {
        const nutriments = await lookupFoodNutrition(newName);
        const qtyNum = typeof newQty === 'number' ? newQty : parseFloat(newQty) || 0;
        const grams = convertToGramsOrMl(qtyNum, newUnit, nutriments.defaultWeight);
        const calculatedKcal = Math.round((grams / 100) * nutriments.kcalPer100g);
        const calculatedProt = Math.round(((grams / 100) * nutriments.proteinPer100g) * 10) / 10;

        setRecord(prev => ({
          ...prev,
          [meal]: prev[meal].map(i =>
            i.id === id
              ? {
                  ...i,
                  calories: calculatedKcal,
                  proteins: calculatedProt,
                  productNameFound: nutriments.productName,
                  source: nutriments.source
                }
              : i
          )
        }));
      } catch (err) {
        // error handling
      }
    }
  };

  // Compute total calories & proteins in real-time
  let totalKcal = 0;
  let totalProt = 0;
  let totalItemsCount = 0;

  Object.values(record).forEach(val => {
    if (Array.isArray(val)) {
      val.forEach(item => {
        if (item.name && item.name.trim()) {
          totalItemsCount++;
          if (item.calories) totalKcal += item.calories;
          if (item.proteins) totalProt += item.proteins;
        }
      });
    }
  });

  const handleValidate = () => {
    onSave({
      ...record,
      isValidated: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-50 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Retourner à l'écran principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                  Relevé alimentaire quotidien
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  OpenFoodFacts
                </span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800"
                  title="Recherche sur https://fdc.nal.usda.gov/ si non disponible sur OpenFoodFacts"
                >
                  USDA FoodData Central
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Saisie des ingestas repas par repas avec équivalences métrologiques (1 càc=5mL, 1 bol=250mL, 1 assiette=250g)
              </p>
            </div>
          </div>

          {/* Quick summary pill */}
          <div className="hidden sm:flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total estimé</span>
              <div className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <span className="text-emerald-700 flex items-center">
                  <Flame className="w-3.5 h-3.5 mr-0.5 text-amber-500" />
                  {totalKcal} kcal
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-700 flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-0.5 text-indigo-500" />
                  {Math.round(totalProt * 10) / 10} g prot
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content: 6 Meal sections */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Information banner */}
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Recherche nutritionnelle en texte libre : </span>
              Saisissez le nom de vos aliments en texte libre. La recherche s'effectue en premier sur <strong>OpenFoodFacts</strong>, et bascule automatiquement sur <strong>USDA FoodData Central (<a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">fdc.nal.usda.gov</a>)</strong> si l'aliment ou ses nutriments ne sont pas trouvés.
            </div>
          </div>

          {/* Meal sections */}
          <div className="space-y-5">
            {MEAL_SECTIONS.map(section => {
              const items = record[section.key];
              const Icon = section.icon;

              // section subtotals
              const subKcal = items.reduce((acc, curr) => acc + (curr.calories || 0), 0);
              const subProt = items.reduce((acc, curr) => acc + (curr.proteins || 0), 0);

              return (
                <div
                  key={section.key}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-xs relative"
                >
                  {/* Section Title Bar */}
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between rounded-t-xl">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-200 text-slate-700">
                        <Icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{section.label}</h3>
                        <span className="text-[11px] text-slate-400">{section.subLabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {items.length > 0 && (
                        <div className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                          <span className="text-emerald-700 font-bold">{subKcal}</span> kcal /{' '}
                          <span className="text-indigo-700 font-bold">{Math.round(subProt * 10) / 10}</span> g prot
                        </div>
                      )}
                      <button
                        type="button"
                        id={`add-food-${section.key}`}
                        onClick={() => addLine(section.key)}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Lines List */}
                  <div className="p-3 sm:p-4">
                    {items.length === 0 ? (
                      <div className="text-center py-3 text-xs text-slate-400 italic">
                        Aucun aliment renseigné pour ce repas. Cliquez sur "+ Ajouter" pour insérer une ligne.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {items.map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-slate-50/70 hover:bg-slate-50 rounded-lg border border-slate-200 text-sm transition-colors"
                          >
                            {/* Food Name Autocomplete */}
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 sm:hidden">
                                Aliment
                              </label>
                              <AutocompleteInput
                                id={`food-name-${section.key}-${idx}`}
                                value={item.name}
                                onChange={val => updateLine(section.key, item.id, { name: val })}
                                placeholder="Nom de l'aliment (ex: Yaourt nature, Pain, Saumon...)"
                                fetchSuggestions={q => {
                                  // Local French medical database matches
                                  const local = searchCommonFoods(q);
                                  return local;
                                }}
                                renderSuggestion={(food: CommonFoodItem) => (
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold text-slate-900">{food.name}</div>
                                      <div className="text-[11px] text-slate-500">
                                        {food.category} • 1 unité ≈ {food.defaultUnitName}
                                      </div>
                                    </div>
                                    <div className="text-right text-xs">
                                      <span className="text-emerald-700 font-bold">{food.kcalPer100g} kcal</span>
                                      <span className="text-slate-400"> /100g</span>
                                    </div>
                                  </div>
                                )}
                                onSelectSuggestion={(selected: CommonFoodItem) => {
                                  updateLine(section.key, item.id, { name: selected.name });
                                }}
                              />
                            </div>

                            {/* Quantity */}
                            <div className="w-full sm:w-28">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 sm:hidden">
                                Quantité
                              </label>
                              <input
                                id={`food-qty-${section.key}-${idx}`}
                                type="number"
                                step="0.25"
                                min="0.1"
                                placeholder="1"
                                value={item.quantity}
                                onChange={e =>
                                  updateLine(section.key, item.id, {
                                    quantity: e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                                  })
                                }
                                className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>

                            {/* Unit Dropdown */}
                            <div className="w-full sm:w-36">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 sm:hidden">
                                Unité
                              </label>
                              <select
                                id={`food-unit-${section.key}-${idx}`}
                                value={item.unit}
                                onChange={e =>
                                  updateLine(section.key, item.id, { unit: e.target.value as FoodUnit })
                                }
                                className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              >
                                {UNITS.map(u => (
                                  <option key={u} value={u}>
                                    {u} {u === 'cuillère à café' ? '(5 mL)' : u === 'bol' ? '(250 mL)' : u === 'assiette' ? '(250 g)' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Calorie & Protein feedback badge */}
                            <div className="w-full sm:w-44 flex flex-col justify-center px-2 py-1 bg-white rounded-md border border-slate-200 text-xs">
                              <div className="flex items-center justify-between sm:justify-end">
                                <span className="text-slate-400 sm:hidden">Valeurs :</span>
                                <span className="font-semibold text-slate-700">
                                  {item.calories ? (
                                    <>
                                      <span className="text-emerald-700 font-bold">{item.calories}</span> kcal
                                      <span className="text-slate-300 mx-1">|</span>
                                      <span className="text-indigo-700 font-bold">{item.proteins}</span> g
                                    </>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">—</span>
                                  )}
                                </span>
                              </div>
                              {item.source && (
                                <div
                                  className="text-[9px] text-right mt-0.5 truncate"
                                  title={item.productNameFound ? `Source ${item.source === 'usda' ? 'USDA (fdc.nal.usda.gov)' : item.source === 'openfoodfacts' ? 'OpenFoodFacts' : 'Base SFNCM'} : ${item.productNameFound}` : undefined}
                                >
                                  {item.source === 'openfoodfacts' && (
                                    <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                      OFF
                                    </span>
                                  )}
                                  {item.source === 'usda' && (
                                    <span className="inline-block px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium" title="Recherché sur fdc.nal.usda.gov">
                                      USDA FDC
                                    </span>
                                  )}
                                  {item.source === 'database' && (
                                    <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                      Base locale
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Delete Button */}
                            <div className="self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => removeLine(section.key, item.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Supprimer cet aliment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span className="font-semibold text-slate-700">{totalItemsCount}</span> aliment(s) renseigné(s) • Total ingestas :{' '}
            <span className="font-bold text-emerald-700">{totalKcal} kcal</span> et{' '}
            <span className="font-bold text-indigo-700">{Math.round(totalProt * 10) / 10} g</span> de protéines
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
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
              onClick={handleValidate}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Valider le relevé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
