import React from 'react';
import { Pill, AlertOctagon, CheckSquare, Square, Flame } from 'lucide-react';
import { OncologicalTreatment } from '../types';

interface TreatmentFormProps {
  treatment: OncologicalTreatment;
  onChange: (updated: OncologicalTreatment) => void;
}

export const TreatmentForm: React.FC<TreatmentFormProps> = ({ treatment, onChange }) => {
  const togglePhase = (key: 'surveillance' | 'radiotherapie' | 'chimiotherapie' | 'immunotherapie') => {
    // If selecting surveillance, uncheck active treatments or vice-versa
    if (key === 'surveillance') {
      const nextVal = !treatment.surveillance;
      onChange({
        ...treatment,
        surveillance: nextVal,
        radiotherapie: nextVal ? false : treatment.radiotherapie,
        chimiotherapie: nextVal ? false : treatment.chimiotherapie,
        immunotherapie: nextVal ? false : treatment.immunotherapie
      });
    } else {
      onChange({
        ...treatment,
        [key]: !treatment[key],
        surveillance: false
      });
    }
  };

  const toggleComorbidity = (key: 'cirrhoseAscite' | 'varicesOesophagiennes' | 'tubeDigestifNonFonctionnel') => {
    onChange({
      ...treatment,
      [key]: !treatment[key]
    });
  };

  const hasActiveTreatment =
    treatment.radiotherapie || treatment.chimiotherapie || treatment.immunotherapie;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Données du traitement oncologique</h2>
          <p className="text-xs text-slate-500">Phases thérapeutiques et comorbidités ayant un impact nutritionnel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phase du traitement */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Phase du traitement
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
              hasActiveTreatment ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {hasActiveTreatment ? 'Cible : 30-35 kcal/kg/j' : 'Cible : 25-30 kcal/kg/j'}
            </span>
          </div>

          <div className="space-y-2.5">
            <label
              htmlFor="treatment-surveillance"
              onClick={() => togglePhase('surveillance')}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                treatment.surveillance
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                id="treatment-surveillance"
                type="checkbox"
                checked={treatment.surveillance}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="ml-3 text-sm">
                <span className="font-semibold block text-slate-900">Surveillance</span>
                <span className="text-xs text-slate-500">Pas de traitement lourd en cours (25 à 30 kcal/kg/j et 1,0 à 1,2 g prot/kg/j)</span>
              </div>
            </label>

            <label
              htmlFor="treatment-radiotherapie"
              onClick={() => togglePhase('radiotherapie')}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                treatment.radiotherapie
                  ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                id="treatment-radiotherapie"
                type="checkbox"
                checked={treatment.radiotherapie}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="ml-3 text-sm">
                <span className="font-semibold block text-slate-900">Radiothérapie</span>
                <span className="text-xs text-slate-500">Irradiation tumorale en cours</span>
              </div>
            </label>

            <label
              htmlFor="treatment-chimiotherapie"
              onClick={() => togglePhase('chimiotherapie')}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                treatment.chimiotherapie
                  ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                id="treatment-chimiotherapie"
                type="checkbox"
                checked={treatment.chimiotherapie}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="ml-3 text-sm">
                <span className="font-semibold block text-slate-900">Chimiothérapie</span>
                <span className="text-xs text-slate-500">Chimiothérapie cytotoxique / ciblée</span>
              </div>
            </label>

            <label
              htmlFor="treatment-immunotherapie"
              onClick={() => togglePhase('immunotherapie')}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                treatment.immunotherapie
                  ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                id="treatment-immunotherapie"
                type="checkbox"
                checked={treatment.immunotherapie}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="ml-3 text-sm">
                <span className="font-semibold block text-slate-900">Immunothérapie</span>
                <span className="text-xs text-slate-500">Inhibiteurs de checkpoints immunitaires</span>
              </div>
            </label>
          </div>
        </div>

        {/* Comorbidités */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Comorbidités
            </h3>
            <span className="text-xs text-slate-500">Précautions de prescription</span>
          </div>

          <div className="space-y-2.5">
            <label
              htmlFor="comorbidity-cirrhose"
              onClick={() => toggleComorbidity('cirrhoseAscite')}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                treatment.cirrhoseAscite
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                id="comorbidity-cirrhose"
                type="checkbox"
                checked={treatment.cirrhoseAscite}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div className="ml-3 text-sm">
                <span className="font-semibold block text-slate-900">Cirrhose avec ascite</span>
                <span className="text-xs text-slate-500">Calcul sur le poids sec et surveillance azotée</span>
              </div>
            </label>

            <label
              htmlFor="comorbidity-varices"
              onClick={() => toggleComorbidity('varicesOesophagiennes')}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                treatment.varicesOesophagiennes
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                id="comorbidity-varices"
                type="checkbox"
                checked={treatment.varicesOesophagiennes}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div className="ml-3 text-sm">
                <span className="font-semibold block text-slate-900">Varices œsophagiennes</span>
                <span className="text-xs text-slate-500">Contre-indication relative pose de sonde nasogastrique</span>
              </div>
            </label>

            <label
              htmlFor="comorbidity-tubedigestif"
              onClick={() => toggleComorbidity('tubeDigestifNonFonctionnel')}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                treatment.tubeDigestifNonFonctionnel
                  ? 'bg-rose-50/80 border-rose-300 text-rose-950 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                id="comorbidity-tubedigestif"
                type="checkbox"
                checked={treatment.tubeDigestifNonFonctionnel}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <div className="ml-3 text-sm">
                <span className="font-semibold block text-slate-900">Tube digestif non fonctionnel</span>
                <span className="text-xs text-slate-500">Occlusion, iléus, grêle court → Indication Parenterale exclusive</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
