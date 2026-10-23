import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface AutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (suggestion: any) => void;
  placeholder?: string;
  fetchSuggestions: (query: string) => Promise<any[]> | any[];
  renderSuggestion?: (item: any) => React.ReactNode;
  getSuggestionValue?: (item: any) => string;
  className?: string;
  disabled?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id,
  value,
  onChange,
  onSelectSuggestion,
  placeholder,
  fetchSuggestions,
  renderSuggestion,
  getSuggestionValue,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!newVal.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(newVal);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  const handleSelect = (item: any) => {
    const strVal = getSuggestionValue ? getSuggestionValue(item) : typeof item === 'string' ? item : item.name || '';
    onChange(strVal);
    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    }
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${isOpen ? 'z-30' : 'z-10'}`}>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value.trim()) {
              handleInputChange({ target: { value } } as any);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full px-3 py-2 pr-8 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-colors ${className}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Search className="w-4 h-4" />}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-72 sm:max-h-80 ring-1 ring-slate-900/10">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>{suggestions.length} aliment(s) suggéré(s)</span>
            <span className="text-slate-400 text-[10px]">Faites défiler pour voir la liste</span>
          </div>
          <ul
            className="overflow-y-auto divide-y divide-slate-100 text-sm overscroll-contain flex-1"
            onWheel={e => e.stopPropagation()}
          >
            {suggestions.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <li
                  key={idx}
                  onMouseDown={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2.5 cursor-pointer transition-colors ${
                    isHighlighted ? 'bg-emerald-50 text-emerald-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {renderSuggestion ? (
                    renderSuggestion(item)
                  ) : (
                    <div>
                      <div className="font-medium text-slate-900">
                        {item.name || item.product_name || item.brand || item}
                      </div>
                      {item.kcalPer100ml && (
                        <div className="text-xs text-slate-500">
                          {item.brand} • {item.kcalPer100ml} kcal/100mL • {item.proteinPer100ml}g prot/100mL
                        </div>
                      )}
                      {item.kcalPer100g && (
                        <div className="text-xs text-slate-500">
                          {item.category} • {item.kcalPer100g} kcal/100g • {item.proteinPer100g}g prot/100g
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
