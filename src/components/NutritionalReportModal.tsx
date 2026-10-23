import React, { useRef, useState } from 'react';
import {
  PatientData,
  OncologicalTreatment,
  NutritionalSupport,
  FoodIntakeRecord,
  TargetCalculation,
  IntakeCalculation,
  DeltaCalculation,
  SfncmRecommendation
} from '../types';
import {
  calculateNutritionalTargets,
  calculateTotalIntakes,
  calculateDelta,
  generateSfncmRecommendation
} from '../services/nutritionService';
import {
  ArrowLeft,
  Download,
  Printer,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { NutritionalReportDocument } from './NutritionalReportDocument';

interface NutritionalReportModalProps {
  patient: PatientData;
  treatment: OncologicalTreatment;
  support: NutritionalSupport;
  foodRecord: FoodIntakeRecord;
  onClose: () => void;
}

export const NutritionalReportModal: React.FC<NutritionalReportModalProps> = ({
  patient,
  treatment,
  support,
  foodRecord,
  onClose
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  // Today's date formatted in French
  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  // Perform core medical calculations
  const target: TargetCalculation = calculateNutritionalTargets(patient, treatment);
  const intake: IntakeCalculation = calculateTotalIntakes(foodRecord, support);
  const delta: DeltaCalculation = calculateDelta(intake, target);
  const recommendation: SfncmRecommendation = generateSfncmRecommendation(
    intake,
    target,
    support,
    treatment,
    patient
  );

  // Patient calculations
  const weight = parseFloat(patient.poidsActuel) || 0;
  const height = parseFloat(patient.taille) || 0;
  const pastWeight = parseFloat(patient.poids6Mois) || 0;

  let imc: string = '—';
  if (weight > 0 && height > 0) {
    const hm = height / 100;
    imc = (weight / (hm * hm)).toFixed(1);
  }

  let weightLossTxt: string = '—';
  let weightLossPct = 0;
  if (weight > 0 && pastWeight > 0) {
    weightLossPct = Math.round((((pastWeight - weight) / pastWeight) * 100) * 10) / 10;
    weightLossTxt = `${weightLossPct > 0 ? `-${weightLossPct}%` : `+${Math.abs(weightLossPct)}%`} (${pastWeight} kg → ${weight} kg)`;
  }

  // Treatments summary tags
  const activeTreatments: string[] = [];
  if (treatment.surveillance) activeTreatments.push('Surveillance');
  if (treatment.radiotherapie) activeTreatments.push('Radiothérapie');
  if (treatment.chimiotherapie) activeTreatments.push('Chimiothérapie');
  if (treatment.immunotherapie) activeTreatments.push('Immunothérapie');
  if (activeTreatments.length === 0) activeTreatments.push('Non renseigné (Surveillance par défaut)');

  const comorbidities: string[] = [];
  if (treatment.cirrhoseAscite) comorbidities.push('Cirrhose avec ascite');
  if (treatment.varicesOesophagiennes) comorbidities.push('Varices œsophagiennes');
  if (treatment.tubeDigestifNonFonctionnel) comorbidities.push('Tube digestif non fonctionnel');

  // Handle PDF Export
  const handleExportPDF = async () => {
    const element = pdfTemplateRef.current || printRef.current;
    if (!element) return;
    try {
      setIsExporting(true);
      
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Erreur de chargement du rendu graphique'));
      });

      const imgWidth = img.width;
      const imgHeight = img.height;
      const margin = 8;
      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = pdfHeight - margin * 2;
      
      const ratio = Math.min(printableWidth / imgWidth, printableHeight / imgHeight);
      const renderWidth = imgWidth * ratio;
      const renderHeight = imgHeight * ratio;
      const imgX = (pdfWidth - renderWidth) / 2;
      const imgY = margin;

      pdf.addImage(dataUrl, 'PNG', imgX, imgY, renderWidth, renderHeight);
      
      const patientSlug = (patient.nom || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Bilan_Nutritionnel_Oncologique_${patientSlug}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to browser print dialog
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const documentProps = {
    patient,
    treatment,
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
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Navigation Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Retourner à la saisie"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight font-display">
                Bilan nutritionnel global
              </h2>
              <p className="text-xs text-slate-400">Synthèse décisionnelle et prescription SFNCM</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              id="export-pdf-button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  <span>Génération A4...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1.5" />
                  <span>Exporter en PDF (A4)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content: On-screen preview */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/60 print:p-0 print:bg-white print:overflow-visible flex justify-center">
          <div
            ref={printRef}
            id="printable-report"
            className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden w-full max-w-[794px] print:border-none print:shadow-none print:max-w-none"
          >
            <NutritionalReportDocument {...documentProps} />
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            Document A4 optimisé pour le dossier médical patient (1 seule page)
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-1.5 text-slate-500" />
              Imprimer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Off-screen fixed A4 render template for 100% consistent PDF capture on Smartphone, Tablet, or PC */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          zIndex: -999,
          pointerEvents: 'none',
          opacity: 1
        }}
        aria-hidden="true"
      >
        <div ref={pdfTemplateRef} className="w-[794px] bg-white">
          <NutritionalReportDocument {...documentProps} />
        </div>
      </div>
    </div>
  );
};
