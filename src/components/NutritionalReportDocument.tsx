import React from 'react';
import {
  PatientData,
  OncologicalTreatment,
  NutritionalSupport,
  TargetCalculation,
  IntakeCalculation,
  DeltaCalculation,
  SfncmRecommendation
} from '../types';
import {
  Calendar,
  Target,
  Flame,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Pill
} from 'lucide-react';

interface NutritionalReportDocumentProps {
  patient: PatientData;
  treatment: OncologicalTreatment;
  support: NutritionalSupport;
  target: TargetCalculation;
  intake: IntakeCalculation;
  delta: DeltaCalculation;
  recommendation: SfncmRecommendation;
  todayFormatted: string;
  imc: string;
  weightLossTxt: string;
  weightLossPct: number;
  activeTreatments: string[];
  comorbidities: string[];
}

export const NutritionalReportDocument: React.FC<NutritionalReportDocumentProps> = ({
  patient,
  support,
  target,
  intake,
  delta,
  recommendation,
  todayFormatted,
  imc,
  weightLossTxt,
  weightLossPct,
  activeTreatments,
  comorbidities
}) => {
  const sefiValue = parseFloat(support.sefi);

  return (
    <div className="w-[794px] bg-white p-6 text-slate-800 space-y-3 font-sans leading-tight">
      {/* 1. Header Document */}
      <div className="border-b-2 border-emerald-600 pb-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800">
                Synthèse Clinique
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Date : {todayFormatted}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5 font-display">
              Bilan Nutritionnel Oncologique
            </h1>
          </div>

          <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <div className="font-bold text-slate-800">
              Score SEFI :{' '}
              <span
                className={`text-sm ${
                  sefiValue < 5 ? 'text-red-600 font-extrabold' : 'text-emerald-700'
                }`}
              >
                {support.sefi || 'Non renseigné'}/10
              </span>
            </div>
            <div className="text-slate-500 text-[10px]">
              {sefiValue < 5 ? 'Alerte : Ingestas sévèrement diminués' : 'Évaluation de l\'appétit'}
            </div>
          </div>
        </div>

        {/* Patient Parameters - Fixed 4 Columns */}
        <div className="mt-2.5 grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Patient</span>
            <span className="font-bold text-slate-900 text-xs truncate block">
              {patient.nom || 'Anonyme'} {patient.age ? `(${patient.age} ans)` : ''}
            </span>
            <span className="text-slate-500 block text-[10px]">
              Sexe : {patient.sexe === 'H' ? 'Homme' : 'Femme'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Poids & Taille</span>
            <span className="font-bold text-slate-900 text-xs">
              {patient.poidsActuel ? `${patient.poidsActuel} kg` : '—'}
            </span>
            <span className="text-slate-500 block text-[10px]">
              Taille : {patient.taille ? `${patient.taille} cm` : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Statut Nutritionnel</span>
            <span className="font-bold text-slate-900 text-xs">IMC : {imc} kg/m²</span>
            <span
              className={`block font-semibold text-[10px] truncate ${
                weightLossPct >= 10
                  ? 'text-red-600'
                  : weightLossPct >= 5
                  ? 'text-amber-600'
                  : 'text-slate-500'
              }`}
            >
              Perte 6m : {weightLossTxt}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Traitement en cours</span>
            <span
              className="font-semibold text-slate-800 block text-[10px] truncate"
              title={activeTreatments.join(', ')}
            >
              {activeTreatments.join(', ')}
            </span>
            {comorbidities.length > 0 && (
              <span
                className="text-amber-700 text-[9px] font-semibold block truncate"
                title={comorbidities.join(', ')}
              >
                Comorb. : {comorbidities.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Cibles Nutritionnelles - Fixed 2 Columns */}
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            1. Cibles nutritionnelles recommandées
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[11px] font-bold text-emerald-900 flex items-center">
                <Flame className="w-3 h-3 mr-1 text-emerald-600" />
                Cible Énergétique
              </span>
              <span className="text-[10px] font-semibold text-emerald-700">
                {target.isActiveTreatment ? '30 à 35 kcal/kg/j' : '25 à 30 kcal/kg/j'}
              </span>
            </div>
            <div className="text-lg font-extrabold text-emerald-950 font-display">
              {target.minKcal} à {target.maxKcal}{' '}
              <span className="text-xs font-medium text-emerald-800">kcal / jour</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-0.5">{target.formulaKcalDesc}</p>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-2.5">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[11px] font-bold text-indigo-900 flex items-center">
                <Zap className="w-3 h-3 mr-1 text-indigo-600" />
                Cible Protéique
              </span>
              <span className="text-[10px] font-semibold text-indigo-700">
                {target.isActiveTreatment ? '1,2 à 1,5 g/kg/j' : '1,0 à 1,2 g/kg/j'}
              </span>
            </div>
            <div className="text-lg font-extrabold text-indigo-950 font-display">
              {target.minProt} à {target.maxProt}{' '}
              <span className="text-xs font-medium text-indigo-800">g de protéines / jour</span>
            </div>
            <p className="text-[10px] text-indigo-700 mt-0.5">{target.formulaProtDesc}</p>
          </div>
        </div>
      </div>

      {/* 3. Détail des Ingestas Quotidiens - Clean Table */}
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Détail des apports quotidiens consommés
          </h3>
        </div>

        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-left divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="py-1.5 px-3">Origine des apports</th>
                <th className="py-1.5 px-3 text-right">Énergie (kcal/j)</th>
                <th className="py-1.5 px-3 text-right">Protéines (g/j)</th>
                <th className="py-1.5 px-3 text-right">Part relative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
              <tr>
                <td className="py-1 px-3 font-medium text-slate-900">
                  Ingestas spontanés (Alimentation courante OpenFoodFacts)
                </td>
                <td className="py-1 px-3 text-right font-semibold text-slate-800">
                  {intake.foodKcal} kcal
                </td>
                <td className="py-1 px-3 text-right font-semibold text-slate-800">
                  {intake.foodProt} g
                </td>
                <td className="py-1 px-3 text-right text-slate-400">
                  {intake.totalKcal > 0
                    ? `${Math.round((intake.foodKcal / intake.totalKcal) * 100)}%`
                    : '0%'}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-3 font-medium text-slate-900">
                  Compléments Nutritionnels Oraux (CNO)
                </td>
                <td className="py-1 px-3 text-right font-semibold text-slate-800">
                  {intake.oralKcal} kcal
                </td>
                <td className="py-1 px-3 text-right font-semibold text-slate-800">
                  {intake.oralProt} g
                </td>
                <td className="py-1 px-3 text-right text-slate-400">
                  {intake.totalKcal > 0
                    ? `${Math.round((intake.oralKcal / intake.totalKcal) * 100)}%`
                    : '0%'}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-3 font-medium text-slate-900">
                  Alimentation artificielle (Entérale & Parentérale)
                </td>
                <td className="py-1 px-3 text-right font-semibold text-slate-800">
                  {intake.enteralKcal + intake.parenteralKcal} kcal
                </td>
                <td className="py-1 px-3 text-right font-semibold text-slate-800">
                  {Math.round((intake.enteralProt + intake.parenteralProt) * 10) / 10} g
                </td>
                <td className="py-1 px-3 text-right text-slate-400">
                  {intake.totalKcal > 0
                    ? `${Math.round(
                        ((intake.enteralKcal + intake.parenteralKcal) / intake.totalKcal) * 100
                      )}%`
                    : '0%'}
                </td>
              </tr>
              <tr className="bg-slate-50/90 font-bold text-slate-900">
                <td className="py-1.5 px-3 text-slate-950">
                  TOTAL GLOBAL DES APPORTS CONSOMMÉS
                </td>
                <td className="py-1.5 px-3 text-right text-emerald-800 text-xs">
                  {intake.totalKcal} kcal/j
                </td>
                <td className="py-1.5 px-3 text-right text-indigo-800 text-xs">
                  {intake.totalProt} g/j
                </td>
                <td className="py-1.5 px-3 text-right text-slate-500">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Comparaison & Case d'évaluation */}
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            3. Comparaison objectifs vs apports réels
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              Objectifs de référence
            </span>
            <div className="text-base font-extrabold text-slate-900">
              {target.minKcal} - {target.maxKcal}{' '}
              <span className="text-[11px] font-normal text-slate-500">kcal</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-600">
              {target.minProt} - {target.maxProt} g de protéines
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              Total apports réels
            </span>
            <div className="text-base font-extrabold text-emerald-700">
              {intake.totalKcal}{' '}
              <span className="text-[11px] font-normal text-slate-500">kcal</span>
            </div>
            <div className="text-[11px] font-semibold text-indigo-700">
              {intake.totalProt} g de protéines
            </div>
          </div>
        </div>

        {/* Delta Card */}
        <div
          className={`p-2 rounded-xl border text-center ${
            delta.status === 'deficit'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : delta.status === 'adapted'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-center space-x-1.5 font-extrabold text-sm">
            {delta.status === 'deficit' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
            {delta.status === 'adapted' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            {delta.status === 'excess' && <AlertCircle className="w-4 h-4 text-amber-600" />}
            <span>{delta.text}</span>
          </div>
          <p className="text-[10px] mt-0.5 opacity-85">
            {delta.status === 'deficit'
              ? 'Couverture insuffisante des besoins métaboliques. Une intervention nutritionnelle est requise.'
              : delta.status === 'adapted'
              ? 'Couverture adéquate des besoins nutritionnels du patient.'
              : 'Apports légèrement supérieurs à la fourchette haute cible.'}
          </p>
        </div>
      </div>

      {/* 5. Proposition de prise en charge SFNCM */}
      {delta.status === 'deficit' && (
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              4. Proposition de prise en charge (Référentiel SFNCM)
            </h3>
          </div>

          <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-2.5 space-y-1.5">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-1">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Recommandation clinique
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                  {recommendation.title}
                </h4>
              </div>
            </div>

            {/* Suggested CNO Prescription */}
            {recommendation.suggestedCno && recommendation.suggestedCno.length > 0 && (
              <div className="bg-white rounded-lg p-1.5 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-900 block mb-1">
                  Schéma posologique suggéré pour combler le déficit :
                </span>
                <div className="space-y-0.5 text-[10px]">
                  {recommendation.suggestedCno.map((cno, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-1 bg-emerald-50/60 rounded text-emerald-950 font-medium"
                    >
                      <span>
                        • <strong>{cno.count}x</strong> {cno.type}
                      </span>
                      <span className="text-emerald-800 font-semibold">
                        +{cno.kcalProvided} kcal / +{cno.proteinProvided}g prot
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation points */}
            <ul className="space-y-0.5 text-[10px] text-slate-700">
              {recommendation.details.map((point, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* Clinical alerts */}
            {recommendation.clinicalAlerts && recommendation.clinicalAlerts.length > 0 && (
              <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 text-[9px] space-y-0.5">
                <span className="font-bold text-amber-900 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                  Points de vigilance :
                </span>
                {recommendation.clinicalAlerts.map((alert, idx) => (
                  <div key={idx} className="text-amber-800 pl-2.5 relative">
                    <span className="absolute left-0.5 top-0">•</span>
                    {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Medical Footer & Signature Area */}
      <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-400 flex items-center justify-between">
        <div>
          <span>Bilan généré le {todayFormatted} • Conforme référentiels SFNCM / Réseau NACRe 2026</span>
        </div>
        <div className="text-right w-44">
          <span className="block font-semibold text-slate-600 text-[9px]">
            Visa / Signature médicale :
          </span>
          <div className="h-5 border-b border-dashed border-slate-300 mt-0.5"></div>
        </div>
      </div>
    </div>
  );
};
