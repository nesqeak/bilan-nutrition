import { Trash2 } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export const INPUT_CLASS =
  'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

export const LABEL_CLASS = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5';

interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={LABEL_CLASS}>
        {label}
      </label>
      {children}
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Unité affichée à droite du champ (cm, kg, mL...). */
  suffix?: string;
}

export function TextInput({ suffix, className = '', ...props }: TextInputProps) {
  return (
    <div className="relative">
      <input {...props} className={`${INPUT_CLASS} ${suffix ? 'pr-10' : ''} ${className}`} />
      {suffix && (
        <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 font-medium pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Classes appliquées quand l'option est sélectionnée. */
  activeClassName?: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  size = 'md'
}: SegmentedControlProps<T>) {
  const sizeClass = size === 'sm' ? 'py-1 px-3 text-xs' : 'py-2.5 px-3 text-sm';
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid grid-flow-col auto-cols-fr gap-2">
      {options.map(option => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`${sizeClass} rounded-lg font-semibold border transition-all cursor-pointer ${
              selected
                ? (option.activeClassName ?? 'bg-emerald-600 text-white border-emerald-600') + ' shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export const YES_NO_OPTIONS: SegmentedOption<'oui' | 'non'>[] = [
  { value: 'non', label: 'Non', activeClassName: 'bg-slate-800 text-white border-slate-800' },
  { value: 'oui', label: 'Oui' }
];

type Tone = 'emerald' | 'indigo' | 'amber' | 'rose';

const TONE_CLASSES: Record<Tone, { card: string; checkbox: string }> = {
  emerald: { card: 'bg-emerald-50/80 border-emerald-300', checkbox: 'accent-emerald-600' },
  indigo: { card: 'bg-indigo-50/80 border-indigo-300', checkbox: 'accent-indigo-600' },
  amber: { card: 'bg-amber-50/80 border-amber-300', checkbox: 'accent-amber-600' },
  rose: { card: 'bg-rose-50/80 border-rose-300', checkbox: 'accent-rose-600' }
};

interface CheckboxCardProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
  tone: Tone;
}

export function CheckboxCard({ id, checked, onChange, title, description, tone }: CheckboxCardProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
        checked ? `${TONE_CLASSES[tone].card} shadow-xs` : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`mt-0.5 h-4 w-4 rounded cursor-pointer ${TONE_CLASSES[tone].checkbox}`}
      />
      <span className="ml-3 text-sm">
        <span className="font-semibold block text-slate-900">{title}</span>
        <span className="text-xs text-slate-500">{description}</span>
      </span>
    </label>
  );
}

/** Bouton de suppression d'une ligne. */
export function DeleteButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
