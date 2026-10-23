import React, { useState, useEffect } from 'react';
import {
  PatientData,
  OncologicalTreatment,
  NutritionalSupport,
  FoodIntakeRecord
} from './types';
import { Header } from './components/Header';
import { PatientForm } from './components/PatientForm';
import { TreatmentForm } from './components/TreatmentForm';
import { NutritionalSupportForm } from './components/NutritionalSupportForm';
import { FoodIntakeModal } from './components/FoodIntakeModal';
import { NutritionalReportModal } from './components/NutritionalReportModal';
import {
  FileText,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Calculator,
  ShieldCheck
} from 'lucide-react';

const INITIAL_PATIENT: PatientData = {
  nom: '',
  age: '',
  sexe: 'H',
  taille: '',
  poidsActuel: '',
  poids6Mois: ''
};

const INITIAL_TREATMENT: OncologicalTreatment = {
  surveillance: true,
  radiotherapie: false,
  chimiotherapie: false,
  immunotherapie: false,
  cirrhoseAscite: false,
  varicesOesophagiennes: false,
  tubeDigestifNonFonctionnel: false
};

const INITIAL_SUPPORT: NutritionalSupport = {
  sefi: '7',
  hasSupport: 'non',
  hasOralSupplement: 'non',
  oralSupplements: [],
  hasEnteral: 'non',
  enteralItems: [],
  hasParenteral: 'non',
  parenteralItems: []
};

const INITIAL_FOOD_RECORD: FoodIntakeRecord = {
  petitDejeuner: [],
  collationMatin: [],
  dejeuner: [],
  gouter: [],
  diner: [],
  collationSoir: [],
  isValidated: false
};

export default function App() {
  const [patient, setPatient] = useState<PatientData>(INITIAL_PATIENT);
  const [treatment, setTreatment] = useState<OncologicalTreatment>(INITIAL_TREATMENT);
  const [support, setSupport] = useState<NutritionalSupport>(INITIAL_SUPPORT);
  const [foodRecord, setFoodRecord] = useState<FoodIntakeRecord>(INITIAL_FOOD_RECORD);

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [weightWarning, setWeightWarning] = useState(false);

  // Clean any previous localStorage traces to ensure 0 retention
  useEffect(() => {
    try {
      localStorage.removeItem('bno_patient');
      localStorage.removeItem('bno_treatment');
      localStorage.removeItem('bno_support');
      localStorage.removeItem('bno_food_record');
    } catch {
      // ignore
    }
  }, []);

  // Reset entire application
  const handleReset = () => {
    setPatient(INITIAL_PATIENT);
    setTreatment(INITIAL_TREATMENT);
    setSupport(INITIAL_SUPPORT);
    setFoodRecord(INITIAL_FOOD_RECORD);
    try {
      localStorage.removeItem('bno_patient');
      localStorage.removeItem('bno_treatment');
      localStorage.removeItem('bno_support');
      localStorage.removeItem('bno_food_record');
    } catch {
      // ignore
    }
    setShowResetConfirm(false);
    setWeightWarning(false);
  };

  const handleOpenReport = () => {
    if (!patient.poidsActuel || parseFloat(patient.poidsActuel) <= 0) {
      setWeightWarning(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setWeightWarning(false);
    setShowReportModal(true);
  };

  const hasDataToReset =
    patient.nom !== '' ||
    patient.poidsActuel !== '' ||
    foodRecord.isValidated ||
    support.hasSupport === 'oui';

  // Count food items logged
  const totalFoodItemsLogged = [
    ...foodRecord.petitDejeuner,
    ...foodRecord.collationMatin,
    ...foodRecord.dejeuner,
    ...foodRecord.gouter,
    ...foodRecord.diner,
    ...foodRecord.collationSoir
  ].filter(i => i.name && i.name.trim()).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans pb-16">
      {/* Top Application Header */}
      <Header onReset={() => setShowResetConfirm(true)} hasDataToReset={hasDataToReset} />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Weight missing warning alert */}
        {weightWarning && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start space-x-3 text-rose-900 shadow-sm animate-pulse">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold">Attention : </span>
              Veuillez renseigner le <strong>poids actuel du patient</strong> dans la section "Données du patient" ci-dessous afin de calculer les cibles caloriques et protéiques de référence.
            </div>
          </div>
        )}

        {/* 1. Patient Data Form */}
        <section aria-label="Données du patient">
          <PatientForm patient={patient} onChange={setPatient} />
        </section>

        {/* 2. Oncological Treatment Form */}
        <section aria-label="Données du traitement oncologique">
          <TreatmentForm treatment={treatment} onChange={setTreatment} />
        </section>

        {/* 3. Nutritional Support Form (SEFI + CNO + Entérale + Parentérale) */}
        <section aria-label="Prise en charge nutritionnelle actuelle">
          <NutritionalSupportForm support={support} onChange={setSupport} />
        </section>

        {/* 4. Action Buttons Card */}
        <section
          aria-label="Actions du bilan"
          className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm sticky bottom-4 z-10"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
              <div className="font-bold text-slate-800 flex items-center justify-center sm:justify-start space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Prêt pour l'évaluation clinique</span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                {foodRecord.isValidated
                  ? `Relevé alimentaire validé (${totalFoodItemsLogged} aliments enregistrés)`
                  : 'Relevé alimentaire non validé ou à compléter'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Button: Relevé alimentaire / Modifier le relevé */}
              <button
                type="button"
                id="open-food-intake-button"
                onClick={() => setShowFoodModal(true)}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                  foodRecord.isValidated
                    ? 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <Utensils className="w-4 h-4 mr-2 text-emerald-600" />
                <span>
                  {foodRecord.isValidated ? 'Modifier le relevé' : 'Relevé alimentaire'}
                </span>
                {foodRecord.isValidated && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                )}
              </button>

              {/* Button: Bilan nutritionnel */}
              <button
                type="button"
                id="open-nutritional-report-button"
                onClick={handleOpenReport}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2" />
                <span>Bilan nutritionnel</span>
                <ChevronRight className="w-4 h-4 ml-1.5 opacity-80" />
              </button>
            </div>
          </div>
        </section>

        {/* Zero-Retention & Medical Confidentiality Notice */}
        <footer className="pt-2 pb-6 text-center text-xs text-slate-500 space-y-1">
          <div className="inline-flex items-center justify-center space-x-1.5 px-3 py-1 bg-slate-200/60 rounded-full text-slate-600 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confidentialité médicale garantie : 100% du traitement est local dans votre navigateur. Aucune donnée n'est envoyée ni enregistrée sur un serveur.</span>
          </div>
        </footer>
      </main>

      {/* Modal: Relevé Alimentaire Quotidien */}
      {showFoodModal && (
        <FoodIntakeModal
          foodRecord={foodRecord}
          onSave={updatedRecord => {
            setFoodRecord(updatedRecord);
            setShowFoodModal(false);
          }}
          onClose={() => setShowFoodModal(false)}
        />
      )}

      {/* Modal: Bilan Nutritionnel Global + Export PDF */}
      {showReportModal && (
        <NutritionalReportModal
          patient={patient}
          treatment={treatment}
          support={support}
          foodRecord={foodRecord}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Confirmation Modal: Réinitialiser */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-xl">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Réinitialiser toutes les données ?
              </h3>
            </div>
            <p className="text-sm text-slate-600">
              Cette action effacera l'ensemble des informations du patient, le traitement oncologique, la prise en charge nutritionnelle et le relevé alimentaire quotidien.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                id="confirm-reset-button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Confirmer l'effacement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
