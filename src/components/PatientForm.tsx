import React from 'react';
import { User, Weight, Ruler, Calendar, Sparkles, AlertTriangle } from 'lucide-react';
import { PatientData } from '../types';

interface PatientFormProps {
  patient: PatientData;
  onChange: (updated: PatientData) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ patient, onChange }) => {
  const handleChange = (field: keyof PatientData, value: string) => {
    onChange({
      ...patient,
      [field]: value
    });
  };

  // Calculations
  const weight = parseFloat(patient.poidsActuel);
  const height = parseFloat(patient.taille);
  const pastWeight = parseFloat(patient.poids6Mois);

  let imc: number | null = null;
  if (!isNaN(weight) && !isNaN(height) && height > 0) {
    const heightM = height / 100;
    imc = Math.round((weight / (heightM * heightM)) * 10) / 10;
  }

  let weightLossPct: number | null = null;
  if (!isNaN(weight) && !isNaN(pastWeight) && pastWeight > 0) {
    weightLossPct = Math.round((((pastWeight - weight) / pastWeight) * 100) * 10) / 10;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Données du patient</h2>
            <p className="text-xs text-slate-500">Informations anthropométriques et administratives</p>
          </div>
        </div>

        {/* Dynamic badges */}
        <div className="flex flex-wrap items-center gap-2">
          {imc !== null && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                imc < 18.5
                  ? 'bg-rose-100 text-rose-800'
                  : imc >= 25
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              IMC : {imc} kg/m²
            </span>
          )}
          {weightLossPct !== null && weightLossPct > 0 && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                weightLossPct >= 10
                  ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-300'
                  : weightLossPct >= 5
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <AlertTriangle className="w-3 h-3 mr-1 inline" />
              Perte : -{weightLossPct}% (6m)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Nom */}
        <div>
          <label htmlFor="patient-nom" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Nom et Prénom du patient
          </label>
          <div className="relative">
            <input
              id="patient-nom"
              type="text"
              placeholder="Ex: Dupont Jean"
              value={patient.nom}
              onChange={e => handleChange('nom', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 transition-colors"
            />
          </div>
        </div>

        {/* Âge */}
        <div>
          <label htmlFor="patient-age" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Âge (ans)
          </label>
          <input
            id="patient-age"
            type="number"
            min="0"
            max="125"
            placeholder="Ex: 68"
            value={patient.age}
            onChange={e => handleChange('age', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 transition-colors"
          />
        </div>

        {/* Sexe */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Sexe
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="patient-sexe-h"
              onClick={() => handleChange('sexe', 'H')}
              className={`py-2.5 px-3 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                patient.sexe === 'H'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Homme (H)
            </button>
            <button
              type="button"
              id="patient-sexe-f"
              onClick={() => handleChange('sexe', 'F')}
              className={`py-2.5 px-3 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                patient.sexe === 'F'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Femme (F)
            </button>
          </div>
        </div>

        {/* Taille */}
        <div>
          <label htmlFor="patient-taille" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Taille (cm)
          </label>
          <div className="relative">
            <input
              id="patient-taille"
              type="number"
              min="50"
              max="250"
              placeholder="Ex: 172"
              value={patient.taille}
              onChange={e => handleChange('taille', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 transition-colors"
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">cm</span>
          </div>
        </div>

        {/* Poids actuel */}
        <div>
          <label htmlFor="patient-poids-actuel" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Poids actuel (kg) <span className="text-emerald-600 font-bold">*</span>
          </label>
          <div className="relative">
            <input
              id="patient-poids-actuel"
              type="number"
              step="0.1"
              min="20"
              max="300"
              placeholder="Ex: 64.5"
              value={patient.poidsActuel}
              onChange={e => handleChange('poidsActuel', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-semibold transition-colors"
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">kg</span>
          </div>
        </div>

        {/* Poids il y a 6 mois */}
        <div>
          <label htmlFor="patient-poids-6mois" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Poids il y a 6 mois (kg)
          </label>
          <div className="relative">
            <input
              id="patient-poids-6mois"
              type="number"
              step="0.1"
              min="20"
              max="300"
              placeholder="Ex: 72.0"
              value={patient.poids6Mois}
              onChange={e => handleChange('poids6Mois', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 transition-colors"
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};
