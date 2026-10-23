import { Lock, RotateCcw, Stethoscope } from 'lucide-react';

export function Header({ onReset }: { onReset: () => void }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-100 shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                Bilan nutritionnel oncologique
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                SFNCM 2026
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Lock className="w-3 h-3 mr-1 text-emerald-600" />
                Zéro enregistrement serveur
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Évaluation des ingestas quotidiens, calcul des cibles et conduite à tenir
            </p>
          </div>
        </div>

        <button
          id="reset-app-button"
          type="button"
          onClick={onReset}
          className="self-end sm:self-auto inline-flex items-center px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all shadow-xs active:scale-95 cursor-pointer"
          title="Effacer tous les champs et réinitialiser les données de la session"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Réinitialiser
        </button>
      </div>
    </header>
  );
}
