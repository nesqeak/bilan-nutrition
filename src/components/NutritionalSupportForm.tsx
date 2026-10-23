import React from 'react';
import {
  NutritionalSupport,
  OralSupplementItem,
  ArtificialNutritionItem,
  OralSupplementType
} from '../types';
import { AutocompleteInput } from './AutocompleteInput';
import { searchNutritionBags, NutritionBagProduct } from '../data/nutritionBags';
import { HeartPulse, Plus, Trash2, Gauge, Milk, Syringe, Droplets, Info } from 'lucide-react';

interface NutritionalSupportFormProps {
  support: NutritionalSupport;
  onChange: (updated: NutritionalSupport) => void;
}

const ORAL_TYPES: OralSupplementType[] = [
  'HP/HC lacté',
  'HP/HC dessert',
  'jus de fruit',
  'soupe',
  'biscuits/madeleines'
];

export const NutritionalSupportForm: React.FC<NutritionalSupportFormProps> = ({
  support,
  onChange
}) => {
  const handleSupportChange = (field: keyof NutritionalSupport, val: any) => {
    onChange({
      ...support,
      [field]: val
    });
  };

  // Add line to Oral Supplements
  const addOralSupplement = () => {
    const newItem: OralSupplementItem = {
      id: 'cno-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: 'HP/HC lacté',
      countPerDay: 1
    };
    onChange({
      ...support,
      oralSupplements: [...support.oralSupplements, newItem]
    });
  };

  const removeOralSupplement = (id: string) => {
    onChange({
      ...support,
      oralSupplements: support.oralSupplements.filter(item => item.id !== id)
    });
  };

  const updateOralSupplement = (id: string, field: keyof OralSupplementItem, val: any) => {
    onChange({
      ...support,
      oralSupplements: support.oralSupplements.map(item =>
        item.id === id ? { ...item, [field]: val } : item
      )
    });
  };

  // Add line to Enteral
  const addEnteralItem = () => {
    const newItem: ArtificialNutritionItem = {
      id: 'ent-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      bagName: '',
      volumeMl: 1000
    };
    onChange({
      ...support,
      enteralItems: [...support.enteralItems, newItem]
    });
  };

  const removeEnteralItem = (id: string) => {
    onChange({
      ...support,
      enteralItems: support.enteralItems.filter(item => item.id !== id)
    });
  };

  const updateEnteralItem = (id: string, updates: Partial<ArtificialNutritionItem>) => {
    onChange({
      ...support,
      enteralItems: support.enteralItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    });
  };

  // Add line to Parenteral
  const addParenteralItem = () => {
    const newItem: ArtificialNutritionItem = {
      id: 'par-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      bagName: '',
      volumeMl: 1000
    };
    onChange({
      ...support,
      parenteralItems: [...support.parenteralItems, newItem]
    });
  };

  const removeParenteralItem = (id: string) => {
    onChange({
      ...support,
      parenteralItems: support.parenteralItems.filter(item => item.id !== id)
    });
  };

  const updateParenteralItem = (id: string, updates: Partial<ArtificialNutritionItem>) => {
    onChange({
      ...support,
      parenteralItems: support.parenteralItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    });
  };

  const sefiNum = parseFloat(support.sefi);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Prise en charge nutritionnelle actuelle
          </h2>
          <p className="text-xs text-slate-500">
            Score SEFI d'auto-évaluation et support nutritionnel en cours
          </p>
        </div>
      </div>

      {/* SEFI & Support Oui/Non Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score SEFI */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="score-sefi-input" className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <Gauge className="w-4 h-4 mr-1.5 text-emerald-600" />
              Score SEFI (0 à 10)
            </label>
            {!isNaN(sefiNum) && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  sefiNum < 5
                    ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-300'
                    : sefiNum < 7
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {sefiNum < 5 ? 'Ingestas très réduits (< 5)' : sefiNum < 7 ? 'Ingestas modérés' : 'Ingestas conservés (≥ 7)'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Évaluation visuelle analogique : 0 = rien mangé, 10 = mange comme d'habitude.
          </p>
          <div className="flex items-center space-x-3">
            <input
              id="score-sefi-input"
              type="number"
              min="0"
              max="10"
              step="0.5"
              placeholder="Ex: 4"
              value={support.sefi}
              onChange={e => handleSupportChange('sefi', e.target.value)}
              className="w-28 px-3.5 py-2 text-sm bg-white font-bold text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
            />
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={isNaN(sefiNum) ? 5 : sefiNum}
                onChange={e => handleSupportChange('sefi', e.target.value)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                <span>0 (Rien)</span>
                <span>5 (Moitié)</span>
                <span>10 (Normal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support nutritionnel Oui/Non */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
          <div>
            <label htmlFor="support-nutritionnel-select" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Support nutritionnel en cours ?
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Le patient bénéficie-t-il actuellement de CNO ou d'une nutrition artificielle ?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="support-nutritionnel-non"
              onClick={() => handleSupportChange('hasSupport', 'non')}
              className={`py-2.5 px-3 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                support.hasSupport === 'non'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Non
            </button>
            <button
              type="button"
              id="support-nutritionnel-oui"
              onClick={() => handleSupportChange('hasSupport', 'oui')}
              className={`py-2.5 px-3 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                support.hasSupport === 'oui'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Oui
            </button>
          </div>
        </div>
      </div>

      {/* Sub-menu if support is "oui" */}
      {support.hasSupport === 'oui' && (
        <div className="p-4 sm:p-5 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-6 animate-fadeIn">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
            <Info className="w-4 h-4 text-emerald-700" />
            <span>Détail du support nutritionnel en cours :</span>
          </div>

          {/* 1. Complémentation Orale (CNO) */}
          <div className="bg-white rounded-lg p-4 border border-emerald-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Milk className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-sm text-slate-900">Complémentation Orale (CNO)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">En cours :</span>
                <select
                  id="select-has-oral-supplement"
                  value={support.hasOralSupplement}
                  onChange={e => handleSupportChange('hasOralSupplement', e.target.value as 'oui' | 'non')}
                  className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-md focus:ring-emerald-500 text-slate-800"
                >
                  <option value="non">Non</option>
                  <option value="oui">Oui</option>
                </select>
              </div>
            </div>

            {support.hasOralSupplement === 'oui' && (
              <div className="space-y-3">
                {support.oralSupplements.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Aucun complément oral renseigné. Cliquez sur "+" pour ajouter un type de CNO.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {support.oralSupplements.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-sm"
                      >
                        <div className="flex-1">
                          <label className="text-[11px] font-medium text-slate-500 block mb-1">
                            Type de complément
                          </label>
                          <select
                            id={`cno-type-${idx}`}
                            value={item.type}
                            onChange={e =>
                              updateOralSupplement(item.id, 'type', e.target.value as OralSupplementType)
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
                          >
                            {ORAL_TYPES.map(t => (
                              <option key={t} value={t}>
                                {t} {t.includes('lacté') || t.includes('dessert') ? '(400 kcal / 20g prot)' : t.includes('jus') || t.includes('soupe') ? '(300 kcal / 8-20g prot)' : '(75 kcal / 4g prot)'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-36">
                          <label className="text-[11px] font-medium text-slate-500 block mb-1">
                            Nombre pris / jour
                          </label>
                          <input
                            id={`cno-count-${idx}`}
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="10"
                            value={item.countPerDay}
                            onChange={e =>
                              updateOralSupplement(item.id, 'countPerDay', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:self-end pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => removeOralSupplement(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  id="add-cno-button"
                  onClick={addOralSupplement}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Ajouter un complément oral
                </button>
              </div>
            )}
          </div>

          {/* 2. Alimentation Entérale */}
          <div className="bg-white rounded-lg p-4 border border-emerald-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-sm text-slate-900">Alimentation Entérale (Sonde / GPE)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">En cours :</span>
                <select
                  id="select-has-enteral"
                  value={support.hasEnteral}
                  onChange={e => handleSupportChange('hasEnteral', e.target.value as 'oui' | 'non')}
                  className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-md focus:ring-emerald-500 text-slate-800"
                >
                  <option value="non">Non</option>
                  <option value="oui">Oui</option>
                </select>
              </div>
            </div>

            {support.hasEnteral === 'oui' && (
              <div className="space-y-3">
                {support.enteralItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Aucune poche entérale renseignée. Cliquez sur "+" pour ajouter une ligne.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {support.enteralItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-sm"
                      >
                        <div className="flex-1">
                          <label className="text-[11px] font-medium text-slate-500 block mb-1">
                            Nom de la poche de nutrition entérale
                          </label>
                          <AutocompleteInput
                            id={`enteral-bag-${idx}`}
                            value={item.bagName}
                            onChange={val => updateEnteralItem(item.id, { bagName: val })}
                            placeholder="Ex: Fresubin 2 kcal HP, Nutrison Energy..."
                            fetchSuggestions={q => searchNutritionBags(q, 'enteral')}
                            onSelectSuggestion={(selected: NutritionBagProduct) => {
                              updateEnteralItem(item.id, {
                                bagName: selected.name,
                                kcalPer100ml: selected.kcalPer100ml,
                                proteinPer100ml: selected.proteinPer100ml
                              });
                            }}
                          />
                        </div>

                        <div className="w-full sm:w-36">
                          <label className="text-[11px] font-medium text-slate-500 block mb-1">
                            Volume (mL)
                          </label>
                          <div className="relative">
                            <input
                              id={`enteral-vol-${idx}`}
                              type="number"
                              step="50"
                              min="50"
                              max="3000"
                              placeholder="1000"
                              value={item.volumeMl || ''}
                              onChange={e =>
                                updateEnteralItem(item.id, { volumeMl: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                            />
                            <span className="absolute right-2 top-1.5 text-[10px] text-slate-400">mL</span>
                          </div>
                        </div>

                        <div className="sm:self-end pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => removeEnteralItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  id="add-enteral-button"
                  onClick={addEnteralItem}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Ajouter une poche entérale
                </button>
              </div>
            )}
          </div>

          {/* 3. Alimentation Parentérale */}
          <div className="bg-white rounded-lg p-4 border border-emerald-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Syringe className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-sm text-slate-900">Alimentation Parentérale (PICC / CVC)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">En cours :</span>
                <select
                  id="select-has-parenteral"
                  value={support.hasParenteral}
                  onChange={e => handleSupportChange('hasParenteral', e.target.value as 'oui' | 'non')}
                  className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-md focus:ring-emerald-500 text-slate-800"
                >
                  <option value="non">Non</option>
                  <option value="oui">Oui</option>
                </select>
              </div>
            </div>

            {support.hasParenteral === 'oui' && (
              <div className="space-y-3">
                {support.parenteralItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Aucune poche parentérale renseignée. Cliquez sur "+" pour ajouter une ligne.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {support.parenteralItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-sm"
                      >
                        <div className="flex-1">
                          <label className="text-[11px] font-medium text-slate-500 block mb-1">
                            Nom de la poche de nutrition parentérale
                          </label>
                          <AutocompleteInput
                            id={`parenteral-bag-${idx}`}
                            value={item.bagName}
                            onChange={val => updateParenteralItem(item.id, { bagName: val })}
                            placeholder="Ex: Olimel N9E, SmofKabiven, Kabiven..."
                            fetchSuggestions={q => searchNutritionBags(q, 'parenteral')}
                            onSelectSuggestion={(selected: NutritionBagProduct) => {
                              updateParenteralItem(item.id, {
                                bagName: selected.name,
                                kcalPer100ml: selected.kcalPer100ml,
                                proteinPer100ml: selected.proteinPer100ml
                              });
                            }}
                          />
                        </div>

                        <div className="w-full sm:w-36">
                          <label className="text-[11px] font-medium text-slate-500 block mb-1">
                            Volume (mL)
                          </label>
                          <div className="relative">
                            <input
                              id={`parenteral-vol-${idx}`}
                              type="number"
                              step="50"
                              min="50"
                              max="3000"
                              placeholder="1000"
                              value={item.volumeMl || ''}
                              onChange={e =>
                                updateParenteralItem(item.id, { volumeMl: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                            />
                            <span className="absolute right-2 top-1.5 text-[10px] text-slate-400">mL</span>
                          </div>
                        </div>

                        <div className="sm:self-end pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => removeParenteralItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  id="add-parenteral-button"
                  onClick={addParenteralItem}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Ajouter une poche parentérale
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
