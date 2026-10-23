import { Activity, AlertCircle, AlertTriangle, Calendar, CheckCircle, Flame, Pill, Target, Zap, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import hclLogo from '../../assets/logo-hcl.jpg';
import { round1 } from '../../lib/utils';
import { NutritionalReport } from '../../lib/report';
import { DeltaStatus, Nutrients } from '../../types';

/** Bandeau institutionnel, identique à celui des PPS (nesqeak/PPS). */
function HclBanner() {
  return (
    <div className="flex items-center justify-between gap-4 pb-[9px] mb-[9px] border-b-[1.5px] border-[#0da8e8]">
      <img src={hclLogo} alt="HCL – Hôpital Lyon Sud" className="h-[57px] w-auto block" />
      <span className="text-[21px] font-bold text-[#0da8e8] tracking-[.01em]">Service de Radiothérapie</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-emerald-600" />
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{children}</h3>
    </div>
  );
}

function InfoCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="text-slate-400 block text-[9px] uppercase font-bold">{label}</span>
      {children}
    </div>
  );
}

const DELTA_STYLES: Record<DeltaStatus, { box: string; icon: ReactNode; comment: string }> = {
  deficit: {
    box: 'bg-rose-50 border-rose-300 text-rose-900',
    icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
    comment: 'Couverture insuffisante des besoins métaboliques. Une intervention nutritionnelle est requise.'
  },
  adapted: {
    box: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
    comment: 'Couverture adéquate des besoins nutritionnels du patient.'
  },
  excess: {
    box: 'bg-amber-50 border-amber-300 text-amber-900',
    icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
    comment: 'Apports légèrement supérieurs à la fourchette haute cible.'
  }
};

const weightLossClass = (pct: number | null) =>
  pct !== null && pct >= 10 ? 'text-red-600' : pct !== null && pct >= 5 ? 'text-amber-600' : 'text-slate-500';

export function NutritionalReportDocument({ report }: { report: NutritionalReport }) {
  const { patient, metrics, target, intake, delta, recommendation, date } = report;
  const sefi = parseFloat(report.sefi);
  const isSefiLow = sefi < 5;

  const weightLossText =
    metrics.weightLossPct === null
      ? '—'
      : `${metrics.weightLossPct > 0 ? '-' : '+'}${Math.abs(metrics.weightLossPct)}% (${metrics.pastWeight} kg → ${metrics.weight} kg)`;

  const intakeRows: { label: string; value: Nutrients }[] = [
    { label: 'Ingestas spontanés (relevé alimentaire)', value: intake.food },
    { label: 'Compléments Nutritionnels Oraux (CNO)', value: intake.oral },
    {
      label: 'Alimentation artificielle (Entérale & Parentérale)',
      value: { kcal: intake.enteral.kcal + intake.parenteral.kcal, prot: round1(intake.enteral.prot + intake.parenteral.prot) }
    }
  ];
  const share = (kcal: number) => (intake.total.kcal > 0 ? `${Math.round((kcal / intake.total.kcal) * 100)}%` : '0%');
  const deltaStyle = DELTA_STYLES[delta.status];

  return (
    <div className="w-[794px] bg-white p-6 text-slate-800 space-y-3 font-sans leading-tight">
      <HclBanner />

      {/* En-tête du document */}
      <div className="border-b-2 border-emerald-600 pb-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800">
                Synthèse Clinique
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Date : {date}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5 font-display">
              Bilan Nutritionnel Oncologique
            </h1>
          </div>

          <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <div className="font-bold text-slate-800">
              Score SEFI :{' '}
              <span className={`text-sm ${isSefiLow ? 'text-red-600 font-extrabold' : 'text-emerald-700'}`}>
                {report.sefi || 'Non renseigné'}/10
              </span>
            </div>
            <div className="text-slate-500 text-[10px]">
              {isSefiLow ? 'Alerte : Ingestas sévèrement diminués' : "Évaluation de l'appétit"}
            </div>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <InfoCell label="Patient">
            <span className="font-bold text-slate-900 truncate block">
              {patient.nom || 'Anonyme'} {patient.age ? `(${patient.age} ans)` : ''}
            </span>
            <span className="text-slate-500 block text-[10px]">Sexe : {patient.sexe === 'H' ? 'Homme' : 'Femme'}</span>
          </InfoCell>
          <InfoCell label="Poids & Taille">
            <span className="font-bold text-slate-900">{patient.poidsActuel ? `${patient.poidsActuel} kg` : '—'}</span>
            <span className="text-slate-500 block text-[10px]">Taille : {patient.taille ? `${patient.taille} cm` : '—'}</span>
          </InfoCell>
          <InfoCell label="Statut Nutritionnel">
            <span className="font-bold text-slate-900">IMC : {metrics.bmi ?? '—'} kg/m²</span>
            <span className={`block font-semibold text-[10px] truncate ${weightLossClass(metrics.weightLossPct)}`}>
              Perte 6m : {weightLossText}
            </span>
          </InfoCell>
          <InfoCell label="Traitement en cours">
            <span className="font-semibold text-slate-800 block text-[10px] truncate">{report.treatments.join(', ')}</span>
            {report.comorbidities.length > 0 && (
              <span className="text-amber-700 text-[9px] font-semibold block truncate">
                Comorb. : {report.comorbidities.join(', ')}
              </span>
            )}
          </InfoCell>
        </div>
      </div>

      {/* 1. Cibles */}
      <div className="space-y-1">
        <SectionTitle icon={Target}>1. Cibles nutritionnelles recommandées</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[11px] font-bold text-emerald-900 flex items-center">
                <Flame className="w-3 h-3 mr-1 text-emerald-600" />
                Cible Énergétique
              </span>
              <span className="text-[10px] font-semibold text-emerald-700">{target.kcalPerKgLabel}</span>
            </div>
            <div className="text-lg font-extrabold text-emerald-950 font-display">
              {target.minKcal} à {target.maxKcal} <span className="text-xs font-medium text-emerald-800">kcal / jour</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-0.5">{target.formulaKcalDesc}</p>
          </div>
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-2.5">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[11px] font-bold text-indigo-900 flex items-center">
                <Zap className="w-3 h-3 mr-1 text-indigo-600" />
                Cible Protéique
              </span>
              <span className="text-[10px] font-semibold text-indigo-700">{target.protPerKgLabel}</span>
            </div>
            <div className="text-lg font-extrabold text-indigo-950 font-display">
              {target.minProt} à {target.maxProt}{' '}
              <span className="text-xs font-medium text-indigo-800">g de protéines / jour</span>
            </div>
            <p className="text-[10px] text-indigo-700 mt-0.5">{target.formulaProtDesc}</p>
          </div>
        </div>
      </div>

      {/* 2. Apports */}
      <div className="space-y-1">
        <SectionTitle icon={Activity}>2. Détail des apports quotidiens consommés</SectionTitle>
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
              {intakeRows.map(row => (
                <tr key={row.label}>
                  <td className="py-1 px-3 font-medium text-slate-900">{row.label}</td>
                  <td className="py-1 px-3 text-right font-semibold text-slate-800">{row.value.kcal} kcal</td>
                  <td className="py-1 px-3 text-right font-semibold text-slate-800">{row.value.prot} g</td>
                  <td className="py-1 px-3 text-right text-slate-400">{share(row.value.kcal)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50/90 font-bold text-slate-900">
                <td className="py-1.5 px-3 text-slate-950">TOTAL GLOBAL DES APPORTS CONSOMMÉS</td>
                <td className="py-1.5 px-3 text-right text-emerald-800 text-xs">{intake.total.kcal} kcal/j</td>
                <td className="py-1.5 px-3 text-right text-indigo-800 text-xs">{intake.total.prot} g/j</td>
                <td className="py-1.5 px-3 text-right text-slate-500">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Comparaison */}
      <div className="space-y-1">
        <SectionTitle icon={Target}>3. Comparaison objectifs vs apports réels</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              Objectifs de référence
            </span>
            <div className="text-base font-extrabold text-slate-900">
              {target.minKcal} - {target.maxKcal} <span className="text-[11px] font-normal text-slate-500">kcal</span>
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
              {intake.total.kcal} <span className="text-[11px] font-normal text-slate-500">kcal</span>
            </div>
            <div className="text-[11px] font-semibold text-indigo-700">{intake.total.prot} g de protéines</div>
          </div>
        </div>
        <div className={`p-2 rounded-xl border text-center ${deltaStyle.box}`}>
          <div className="flex items-center justify-center gap-1.5 font-extrabold text-sm">
            {deltaStyle.icon}
            <span>{delta.text}</span>
          </div>
          <p className="text-[10px] mt-0.5 opacity-85">{deltaStyle.comment}</p>
        </div>
      </div>

      {/* 4. Proposition de prise en charge */}
      {delta.status === 'deficit' && (
        <div className="space-y-1">
          <SectionTitle icon={Pill}>4. Proposition de prise en charge (Référentiel SFNCM)</SectionTitle>
          <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-2.5 space-y-1.5">
            <div className="border-b border-slate-200 pb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Recommandation clinique
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-0.5">{recommendation.title}</h4>
            </div>

            {recommendation.suggestedCno && (
              <div className="bg-white rounded-lg p-1.5 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-900 block mb-1">
                  Schéma posologique suggéré pour combler le déficit :
                </span>
                <div className="space-y-0.5 text-[10px]">
                  {recommendation.suggestedCno.map(cno => (
                    <div
                      key={cno.type}
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

            <ul className="space-y-0.5 text-[10px] text-slate-700">
              {recommendation.details.map(point => (
                <li key={point} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {recommendation.clinicalAlerts.length > 0 && (
              <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 text-[9px] space-y-0.5">
                <span className="font-bold text-amber-900 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                  Points de vigilance :
                </span>
                {recommendation.clinicalAlerts.map(alert => (
                  <div key={alert} className="text-amber-800 pl-2.5 relative">
                    <span className="absolute left-0.5 top-0">•</span>
                    {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pied de page */}
      <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-400 flex items-center justify-between">
        <span>Bilan généré le {date} • Conforme référentiels SFNCM / Réseau NACRe 2026</span>
        <div className="text-right w-44">
          <span className="block font-semibold text-slate-600">Visa / Signature médicale :</span>
          <div className="h-5 border-b border-dashed border-slate-300 mt-0.5" />
        </div>
      </div>
    </div>
  );
}
