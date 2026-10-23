import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface CardProps {
  icon: LucideIcon;
  /** Classes de la pastille d'icône (fond + couleur). */
  iconClassName: string;
  title: string;
  subtitle: string;
  /** Contenu affiché à droite du titre (badges...). */
  aside?: ReactNode;
  children: ReactNode;
}

export function Card({ icon: Icon, iconClassName, title, subtitle, aside, children }: CardProps) {
  return (
    <section aria-label={title} className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${iconClassName}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {aside && <div className="flex flex-wrap items-center gap-2">{aside}</div>}
      </div>
      {children}
    </section>
  );
}
