import { ArrowLeft, Download, Loader2, Printer } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { buildNutritionalReport } from '../../lib/report';
import { FoodIntakeRecord, NutritionalSupport, OncologicalTreatment, PatientData } from '../../types';
import { Modal } from '../ui/Modal';
import { NutritionalReportDocument } from './NutritionalReportDocument';

interface NutritionalReportModalProps {
  patient: PatientData;
  treatment: OncologicalTreatment;
  support: NutritionalSupport;
  foodRecord: FoodIntakeRecord;
  onClose: () => void;
}

const PDF_MARGIN_MM = 8;

/** Capture l'élément en image et l'enregistre dans un PDF A4 d'une page. */
async function exportElementToPdf(element: HTMLElement, fileName: string) {
  const [{ toJpeg }, { default: jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);

  const dataUrl = await toJpeg(element, { quality: 0.92, pixelRatio: 2, backgroundColor: '#ffffff', cacheBust: true });
  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(
    (pageWidth - PDF_MARGIN_MM * 2) / img.width,
    (pageHeight - PDF_MARGIN_MM * 2) / img.height
  );
  const width = img.width * ratio;
  const height = img.height * ratio;

  pdf.addImage(dataUrl, 'JPEG', (pageWidth - width) / 2, PDF_MARGIN_MM, width, height);
  pdf.save(fileName);
}

export function NutritionalReportModal({ patient, treatment, support, foodRecord, onClose }: NutritionalReportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
  const report = useMemo(
    () => buildNutritionalReport(patient, treatment, support, foodRecord),
    [patient, treatment, support, foodRecord]
  );

  const handleExportPdf = async () => {
    if (!pdfTemplateRef.current) return;
    setIsExporting(true);
    try {
      const slug = (patient.nom || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
      const day = new Date().toISOString().slice(0, 10);
      await exportElementToPdf(pdfTemplateRef.current, `Bilan_Nutritionnel_Oncologique_${slug}_${day}.pdf`);
    } catch (err) {
      console.error('Erreur lors de la génération du PDF :', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal title="Bilan nutritionnel global" onClose={onClose} className="max-w-4xl bg-white">
      <div className="flex flex-col max-h-[94vh]">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Retourner à la saisie"
              aria-label="Retourner à la saisie"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight font-display">Bilan nutritionnel global</h2>
              <p className="text-xs text-slate-400">Synthèse décisionnelle et prescription SFNCM</p>
            </div>
          </div>
          <button
            type="button"
            id="export-pdf-button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-1.5" />
            )}
            {isExporting ? 'Génération A4...' : 'Exporter en PDF (A4)'}
          </button>
        </div>

        {/* Aperçu à l'écran (également utilisé pour l'impression) */}
        <div className="flex-1 overflow-auto p-3 sm:p-5 bg-slate-100/60 print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-report"
            className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden w-fit mx-auto print:border-none print:shadow-none"
          >
            <NutritionalReportDocument report={report} />
          </div>
        </div>

        <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
          <span className="text-xs text-slate-500">Document A4 optimisé pour le dossier médical patient (1 seule page)</span>
          <div className="flex items-center gap-2">
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

      {/* Gabarit A4 hors écran, à largeur fixe, pour une capture PDF identique sur tous les appareils */}
      <div aria-hidden="true" className="fixed top-0 -left-[9999px] w-[794px] pointer-events-none">
        <div ref={pdfTemplateRef} className="w-[794px] bg-white">
          <NutritionalReportDocument report={report} />
        </div>
      </div>
    </Modal>
  );
}
