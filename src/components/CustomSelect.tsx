import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className = "",
  icon,
  searchable
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(o => o.value === value);

  // Automatically enable search if options length > 5 or if searchable prop is explicitly set
  const showSearch = searchable !== undefined ? searchable : options.length > 5;

  const filteredOptions = showSearch && searchTerm.trim()
    ? options.filter(o => 
        o.label.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        o.value.toLowerCase().includes(searchTerm.toLowerCase().trim())
      )
    : options;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && showSearch) {
      setSearchTerm('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, showSearch]);

  return (
    <div ref={containerRef} className={`relative w-full font-sans ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-sm text-wood-950 bg-wood-50/50 border border-wood-200 hover:border-wood-400 rounded-xl px-4 py-3 shadow-2xs focus:ring-1 focus:ring-wood-500 focus:outline-hidden transition-all cursor-pointer"
      >
        <div className="flex items-center space-x-2.5 truncate">
          {icon && <div className="text-wood-400 shrink-0">{icon}</div>}
          {selectedOption ? (
            <span className="font-semibold truncate">{selectedOption.label}</span>
          ) : (
            <span className="text-wood-400 font-medium">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown size={16} className="text-wood-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-wood-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
          {showSearch && (
            <div className="p-2 bg-wood-50 border-b border-wood-150 flex items-center space-x-2 sticky top-0 z-10">
              <Search size={14} className="text-wood-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search banks / options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-0 outline-hidden py-1 text-xs text-wood-950 placeholder-wood-400 font-medium focus:ring-0"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-wood-400 hover:text-wood-700 rounded-full"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto divide-y divide-wood-50/60 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-wood-400 font-medium">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-wood-50/80 transition-colors flex items-center justify-between gap-2 text-xs cursor-pointer ${
                      isSelected ? 'bg-wood-50/50 text-wood-950 font-semibold' : 'text-wood-700 font-medium'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check size={14} className="text-wood-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
