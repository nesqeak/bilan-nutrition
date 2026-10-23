import { Droplets, Gauge, HeartPulse, Info, Milk, Plus, Syringe, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { NutritionBagProduct, searchNutritionBags } from '../../data/nutritionBags';
import { ORAL_SUPPLEMENTS, ORAL_SUPPLEMENT_TYPES } from '../../data/referenceValues';
import { createId } from '../../lib/utils';
import {
  ArtificialNutritionItem,
  ArtificialRoute,
  NutritionalSupport,
  OralSupplementItem,
  YesNo
} from '../../types';
import { AutocompleteInput } from '../ui/AutocompleteInput';
import { Card } from '../ui/Card';
import { DeleteButton, INPUT_CLASS, SegmentedControl, TextInput, YES_NO_OPTIONS } from '../ui/controls';

interface NutritionalSupportFormProps {
  support: NutritionalSupport;
  onChange: (support: NutritionalSupport) => void;
}

const SMALL_LABEL = 'text-[11px] font-medium text-slate-500 block mb-1';
const ROW_CLASS = 'flex flex-col sm:flex-row sm:items-end gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200';

function sefiStatus(sefi: number) {
  if (sefi < 5) return { label: 'Ingestas très réduits (< 5)', className: 'bg-rose-100 text-rose-800 ring-1 ring-rose-300' };
  if (sefi < 7) return { label: 'Ingestas modérés', className: 'bg-amber-100 text-amber-800' };
  return { label: 'Ingestas conservés (≥ 7)', className: 'bg-emerald-100 text-emerald-800' };
}

export function NutritionalSupportForm({ support, onChange }: NutritionalSupportFormProps) {
  const set = <K extends keyof NutritionalSupport>(field: K, value: NutritionalSupport[K]) =>
    onChange({ ...support, [field]: value });

  const sefi = parseFloat(support.sefi);
  const status = Number.isFinite(sefi) ? sefiStatus(sefi) : null;

  return (
    <Card
      icon={HeartPulse}
      iconClassName="bg-emerald-50 text-emerald-700"
      title="Prise en charge nutritionnelle actuelle"
      subtitle="Score SEFI d'auto-évaluation et support nutritionnel en cours"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score SEFI */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label
                htmlFor="score-sefi-input"
                className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center"
              >
                <Gauge className="w-4 h-4 mr-1.5 text-emerald-600" />
                Score SEFI (0 à 10)
              </label>
              {status && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
                  {status.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Évaluation visuelle analogique : 0 = rien mangé, 10 = mange comme d'habitude.
            </p>
            <div className="flex items-center gap-3">
              <TextInput
                id="score-sefi-input"
                type="number"
                min={0}
                max={10}
                step={0.5}
                placeholder="Ex: 4"
                className="w-24 font-bold text-center"
                value={support.sefi}
                onChange={e => set('sefi', e.target.value)}
              />
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  aria-label="Score SEFI"
                  value={Number.isFinite(sefi) ? sefi : 5}
                  onChange={e => set('sefi', e.target.value)}
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

          {/* Support nutritionnel oui / non */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Support nutritionnel en cours ?
              </span>
              <p className="text-xs text-slate-500">
                Le patient bénéficie-t-il actuellement de CNO ou d'une nutrition artificielle ?
              </p>
            </div>
            <SegmentedControl
              ariaLabel="Support nutritionnel en cours"
              value={support.hasSupport}
              options={YES_NO_OPTIONS}
              onChange={value => set('hasSupport', value)}
            />
          </div>
        </div>

        {support.hasSupport === 'oui' && (
          <div className="p-4 sm:p-5 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Détail du support nutritionnel en cours :</span>
            </div>

            <SupportSection
              icon={Milk}
              iconClassName="text-emerald-600"
              title="Complémentation Orale (CNO)"
              active={support.hasOralSupplement}
              onActiveChange={value => set('hasOralSupplement', value)}
            >
              <OralSupplementList items={support.oralSupplements} onChange={items => set('oralSupplements', items)} />
            </SupportSection>

            <SupportSection
              icon={Droplets}
              iconClassName="text-indigo-600"
              title="Alimentation Entérale (Sonde / GPE)"
              active={support.hasEnteral}
              onActiveChange={value => set('hasEnteral', value)}
            >
              <BagList route="enteral" items={support.enteralItems} onChange={items => set('enteralItems', items)} />
            </SupportSection>

            <SupportSection
              icon={Syringe}
              iconClassName="text-purple-600"
              title="Alimentation Parentérale (PICC / CVC)"
              active={support.hasParenteral}
              onActiveChange={value => set('hasParenteral', value)}
            >
              <BagList
                route="parenteral"
                items={support.parenteralItems}
                onChange={items => set('parenteralItems', items)}
              />
            </SupportSection>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */

interface SupportSectionProps {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  active: YesNo;
  onActiveChange: (value: YesNo) => void;
  children: ReactNode;
}

function SupportSection({ icon: Icon, iconClassName, title, active, onActiveChange, children }: SupportSectionProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-emerald-100 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconClassName}`} />
          <span className="font-semibold text-sm text-slate-900">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">En cours :</span>
          <SegmentedControl ariaLabel={`${title} en cours`} size="sm" value={active} options={YES_NO_OPTIONS} onChange={onActiveChange} />
        </div>
      </div>
      {active === 'oui' && <div className="space-y-3 pt-3 border-t border-slate-100">{children}</div>}
    </div>
  );
}

function AddButton({ onClick, className, children }: { onClick: () => void; className: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${className}`}
    >
      <Plus className="w-3.5 h-3.5 mr-1" />
      {children}
    </button>
  );
}

const EmptyHint = ({ children }: { children: ReactNode }) => (
  <p className="text-xs text-slate-400 italic py-2">{children}</p>
);

/** Met à jour un élément d'une liste par identifiant. */
const updateById = <T extends { id: string }>(items: T[], id: string, updates: Partial<T>) =>
  items.map(item => (item.id === id ? { ...item, ...updates } : item));

/* ------------------------------------------------------------------ */

function OralSupplementList({
  items,
  onChange
}: {
  items: OralSupplementItem[];
  onChange: (items: OralSupplementItem[]) => void;
}) {
  const add = () => onChange([...items, { id: createId('cno'), type: 'HP/HC lacté', countPerDay: 1 }]);

  return (
    <>
      {items.length === 0 ? (
        <EmptyHint>Aucun complément oral renseigné.</EmptyHint>
      ) : (
        items.map((item, idx) => (
          <div key={item.id} className={ROW_CLASS}>
            <div className="flex-1">
              <label htmlFor={`cno-type-${idx}`} className={SMALL_LABEL}>
                Type de complément
              </label>
              <select
                id={`cno-type-${idx}`}
                value={item.type}
                onChange={e => onChange(updateById(items, item.id, { type: e.target.value as OralSupplementItem['type'] }))}
                className={INPUT_CLASS}
              >
                {ORAL_SUPPLEMENT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type} ({ORAL_SUPPLEMENTS[type].kcal} kcal / {ORAL_SUPPLEMENTS[type].prot} g prot)
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-36">
              <label htmlFor={`cno-count-${idx}`} className={SMALL_LABEL}>
                Nombre pris / jour
              </label>
              <TextInput
                id={`cno-count-${idx}`}
                type="number"
                step={0.5}
                min={0}
                max={10}
                className="font-semibold"
                value={item.countPerDay}
                onChange={e => onChange(updateById(items, item.id, { countPerDay: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <DeleteButton label="Supprimer la ligne" onClick={() => onChange(items.filter(i => i.id !== item.id))} />
          </div>
        ))
      )}
      <AddButton onClick={add} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
        Ajouter un complément oral
      </AddButton>
    </>
  );
}

/* ------------------------------------------------------------------ */

const BAG_LIST_CONFIG: Record<ArtificialRoute, { label: string; placeholder: string; addLabel: string; addClass: string }> = {
  enteral: {
    label: 'Nom de la poche de nutrition entérale',
    placeholder: 'Ex: Fresubin 2 kcal HP, Nutrison Energy...',
    addLabel: 'Ajouter une poche entérale',
    addClass: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
  },
  parenteral: {
    label: 'Nom de la poche de nutrition parentérale',
    placeholder: 'Ex: Olimel N9E, SmofKabiven, Kabiven...',
    addLabel: 'Ajouter une poche parentérale',
    addClass: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
  }
};

function BagList({
  route,
  items,
  onChange
}: {
  route: ArtificialRoute;
  items: ArtificialNutritionItem[];
  onChange: (items: ArtificialNutritionItem[]) => void;
}) {
  const config = BAG_LIST_CONFIG[route];
  const add = () => onChange([...items, { id: createId(route), bagName: '', volumeMl: 1000 }]);

  return (
    <>
      {items.length === 0 ? (
        <EmptyHint>Aucune poche renseignée.</EmptyHint>
      ) : (
        items.map((item, idx) => (
          <div key={item.id} className={ROW_CLASS}>
            <div className="flex-1">
              <label htmlFor={`${route}-bag-${idx}`} className={SMALL_LABEL}>
                {config.label}
              </label>
              <AutocompleteInput<NutritionBagProduct>
                id={`${route}-bag-${idx}`}
                value={item.bagName}
                placeholder={config.placeholder}
                // Une saisie libre invalide les valeurs de la poche précédemment choisie.
                onChange={bagName =>
                  onChange(updateById(items, item.id, { bagName, kcalPer100ml: undefined, proteinPer100ml: undefined }))
                }
                onSelect={bag =>
                  onChange(
                    updateById(items, item.id, {
                      bagName: bag.name,
                      kcalPer100ml: bag.kcalPer100ml,
                      proteinPer100ml: bag.proteinPer100ml
                    })
                  )
                }
                getSuggestions={q => searchNutritionBags(q, route)}
                getKey={bag => bag.name}
                renderSuggestion={bag => (
                  <div>
                    <div className="font-medium text-slate-900">{bag.name}</div>
                    <div className="text-xs text-slate-500">
                      {bag.brand} • {bag.kcalPer100ml} kcal/100mL • {bag.proteinPer100ml} g prot/100mL
                    </div>
                  </div>
                )}
              />
            </div>
            <div className="w-full sm:w-36">
              <label htmlFor={`${route}-vol-${idx}`} className={SMALL_LABEL}>
                Volume
              </label>
              <TextInput
                id={`${route}-vol-${idx}`}
                type="number"
                step={50}
                min={0}
                max={3000}
                placeholder="1000"
                suffix="mL"
                className="font-semibold"
                value={item.volumeMl || ''}
                onChange={e => onChange(updateById(items, item.id, { volumeMl: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <DeleteButton label="Supprimer la ligne" onClick={() => onChange(items.filter(i => i.id !== item.id))} />
          </div>
        ))
      )}
      <AddButton onClick={add} className={config.addClass}>
        {config.addLabel}
      </AddButton>
    </>
  );
}
