import { Search } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { INPUT_CLASS } from './controls';

interface AutocompleteInputProps<T> {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  getSuggestions: (query: string) => T[];
  renderSuggestion: (item: T) => ReactNode;
  getKey: (item: T) => string;
  placeholder?: string;
  /** Icône ou indicateur affiché à droite du champ (par défaut : loupe). */
  adornment?: ReactNode;
}

const MAX_SUGGESTIONS = 30;

export function AutocompleteInput<T>({
  id,
  value,
  onChange,
  onSelect,
  getSuggestions,
  renderSuggestion,
  getKey,
  placeholder,
  adornment
}: AutocompleteInputProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const suggestions = isOpen && value.trim() ? getSuggestions(value).slice(0, MAX_SUGGESTIONS) : [];
  const showList = suggestions.length > 0;

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const select = (item: T) => {
    onSelect(item);
    setIsOpen(false);
    setHighlighted(-1);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!showList) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(i => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && suggestions[highlighted]) {
      e.preventDefault();
      select(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${showList ? 'z-30' : ''}`}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={e => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlighted(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
        className={`${INPUT_CLASS} pr-8`}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
        {adornment ?? <Search className="w-4 h-4" />}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-72 overflow-y-auto overscroll-contain bg-white border border-slate-300 rounded-xl shadow-2xl ring-1 ring-slate-900/10 divide-y divide-slate-100 text-sm"
        >
          {suggestions.map((item, idx) => (
            <li
              key={getKey(item)}
              role="option"
              aria-selected={idx === highlighted}
              onMouseDown={e => {
                e.preventDefault();
                select(item);
              }}
              onMouseEnter={() => setHighlighted(idx)}
              className={`px-3.5 py-2.5 cursor-pointer transition-colors ${
                idx === highlighted ? 'bg-emerald-50 text-emerald-950' : 'text-slate-700'
              }`}
            >
              {renderSuggestion(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
