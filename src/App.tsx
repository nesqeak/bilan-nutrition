import { AlertCircle, ChevronRight, FileText, RotateCcw, ShieldCheck, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FoodIntakeModal } from './components/food/FoodIntakeModal';
import { NutritionalSupportForm } from './components/forms/NutritionalSupportForm';
import { PatientForm } from './components/forms/PatientForm';
import { TreatmentForm } from './components/forms/TreatmentForm';
import { Header } from './components/Header';
import { NutritionalReportModal } from './components/report/NutritionalReportModal';
import { Modal } from './components/ui/Modal';
import { INITIAL_FOOD_RECORD, INITIAL_PATIENT, INITIAL_SUPPORT, INITIAL_TREATMENT } from './data/initialState';
import { filledFoodItems } from './lib/clinical';
import { toPositiveNumber } from './lib/utils';

type OpenModal = 'food' | 'report' | 'reset' | null;

/** Clés utilisées par d'anciennes versions : supprimées pour garantir l'absence de rétention. */
const LEGACY_STORAGE_KEYS = ['bno_patient', 'bno_treatment', 'bno_support', 'bno_food_record'];

export default function App() {
  const [patient, setPatient] = useState(INITIAL_PATIENT);
  const [treatment, setTreatment] = useState(INITIAL_TREATMENT);
  const [support, setSupport] = useState(INITIAL_SUPPORT);
  const [foodRecord, setFoodRecord] = useState(INITIAL_FOOD_RECORD);
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [weightWarning, setWeightWarning] = useState(false);

  useEffect(() => {
    try {
      LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    } catch {
      // Stockage indisponible : rien à nettoyer.
    }
  }, []);

  const closeModal = () => setOpenModal(null);

  const handleReset = () => {
    setPatient(INITIAL_PATIENT);
    setTreatment(INITIAL_TREATMENT);
    setSupport(INITIAL_SUPPORT);
    setFoodRecord(INITIAL_FOOD_RECORD);
    setWeightWarning(false);
    closeModal();
  };

  const handleOpenReport = () => {
    if (!toPositiveNumber(patient.poidsActuel)) {
      setWeightWarning(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setWeightWarning(false);
    setOpenModal('report');
  };

  const foodItemCount = filledFoodItems(foodRecord).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans pb-16">
      <Header onReset={() => setOpenModal('reset')} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {weightWarning && (
          <div role="alert" className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-rose-900 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm">
              <span className="font-bold">Attention : </span>
              Veuillez renseigner le <strong>poids actuel du patient</strong> dans la section « Données du patient »
              afin de calculer les cibles caloriques et protéiques de référence.
            </p>
          </div>
        )}

        <PatientForm patient={patient} onChange={setPatient} />
        <TreatmentForm treatment={treatment} onChange={setTreatment} />
        <NutritionalSupportForm support={support} onChange={setSupport} />

        {/* Actions */}
        <section
          aria-label="Actions du bilan"
          className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm sticky bottom-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="text-center sm:text-left">
            <div className="font-bold text-sm text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Prêt pour l'évaluation clinique
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              {foodRecord.isValidated
                ? `Relevé alimentaire validé (${foodItemCount} aliments enregistrés)`
                : 'Relevé alimentaire non validé ou à compléter'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              id="open-food-intake-button"
              onClick={() => setOpenModal('food')}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                foodRecord.isValidated
                  ? 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Utensils className="w-4 h-4 mr-2 text-emerald-600" />
              {foodRecord.isValidated ? 'Modifier le relevé' : 'Relevé alimentaire'}
              {foodRecord.isValidated && <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500" />}
            </button>
            <button
              type="button"
              id="open-nutritional-report-button"
              onClick={handleOpenReport}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2" />
              Bilan nutritionnel
              <ChevronRight className="w-4 h-4 ml-1.5 opacity-80" />
            </button>
          </div>
        </section>

        <footer className="pt-2 pb-6 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-200/60 rounded-full text-slate-600 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Confidentialité médicale : les données du patient restent dans votre navigateur et ne sont ni envoyées ni
              enregistrées sur un serveur. Seuls les noms d'aliments saisis sont envoyés à OpenFoodFacts.
            </span>
          </div>
        </footer>
      </main>

      {openModal === 'food' && (
        <FoodIntakeModal
          foodRecord={foodRecord}
          onSave={record => {
            setFoodRecord(record);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}

      {openModal === 'report' && (
        <NutritionalReportModal
          patient={patient}
          treatment={treatment}
          support={support}
          foodRecord={foodRecord}
          onClose={closeModal}
        />
      )}

      {openModal === 'reset' && (
        <Modal title="Réinitialiser toutes les données" onClose={closeModal} className="max-w-md bg-white">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl text-red-600">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Réinitialiser toutes les données ?</h3>
            </div>
            <p className="text-sm text-slate-600">
              Cette action effacera l'ensemble des informations du patient, le traitement oncologique, la prise en charge
              nutritionnelle et le relevé alimentaire quotidien.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
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
        </Modal>
      )}
    </div>
  );
}
