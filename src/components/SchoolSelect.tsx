import React, { useState, useRef, useEffect } from 'react';
import { School } from '../types';
import { Check, ChevronsUpDown, Search, School as SchoolIcon, X } from 'lucide-react';

interface SchoolSelectProps {
  schools: School[];
  value: string;
  onChange: (schoolId: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SchoolSelect({
  schools,
  value,
  onChange,
  placeholder = "Select your tertiary institution...",
  className = ""
}: SchoolSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSchool = schools.find(s => s.id === value);

  // Filter schools based on search query (by name or abbreviation)
  const filteredSchools = schools.filter(school => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    
    const nameMatch = school.name.toLowerCase().includes(term);
    const abbrMatch = school.abbreviation?.toLowerCase().includes(term);
    const stateMatch = school.state.toLowerCase().includes(term);
    
    return nameMatch || abbrMatch || stateMatch;
  });

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Clickable Display Target */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchTerm('');
        }}
        className={`w-full flex items-center justify-between text-left text-sm text-wood-950 transition-all cursor-pointer focus:outline-hidden ${
          className.includes('border-0')
            ? 'bg-transparent border-0 px-1 py-3 focus:ring-0 shadow-none'
            : 'bg-wood-50/50 border border-wood-200 hover:border-wood-400 rounded-xl px-4 py-3 shadow-2xs focus:ring-1 focus:ring-wood-500'
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <SchoolIcon size={16} className="text-wood-400 shrink-0" />
          {selectedSchool ? (
            <span className="font-semibold truncate">
              {selectedSchool.name} 
              {selectedSchool.abbreviation && (
                <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold bg-wood-100 text-wood-700 rounded-md">
                  {selectedSchool.abbreviation}
                </span>
              )}
            </span>
          ) : (
            <span className="text-wood-400 font-medium">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onChange('');
                }
              }}
              className="p-1 text-wood-400 hover:text-red-500 rounded-full hover:bg-wood-100/50 transition-colors cursor-pointer inline-flex items-center justify-center"
              title="Clear selection"
            >
              <X size={12} />
            </span>
          )}
          <ChevronsUpDown size={16} className="text-wood-400 shrink-0" />
        </div>
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-wood-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
          {/* Search Box */}
          <div className="p-2.5 bg-wood-50 border-b border-wood-100 flex items-center space-x-2">
            <Search size={14} className="text-wood-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search by school name, state, or abbreviation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-0 outline-hidden py-1 text-xs text-wood-950 placeholder-wood-400 font-medium focus:ring-0"
            />
          </div>

          {/* List of options */}
          <div className="max-h-60 overflow-y-auto divide-y divide-wood-50/60 custom-scrollbar">
            {filteredSchools.length === 0 ? (
              <div className="p-4 text-center text-xs text-wood-400">
                No matching Nigerian schools found.
              </div>
            ) : (
              filteredSchools.map((school) => {
                const isSelected = school.id === value;
                return (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => {
                      onChange(school.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-wood-50/80 transition-colors flex items-center justify-between gap-2 text-xs cursor-pointer ${
                      isSelected ? 'bg-wood-50/50 text-wood-950 font-semibold' : 'text-wood-700 font-medium'
                    }`}
                  >
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <span className="truncate">{school.name}</span>
                        {school.abbreviation && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-wood-100 border border-wood-150 text-wood-700 rounded-sm">
                            {school.abbreviation}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-wood-400 font-normal">
                        {school.ownership} • {school.type} • {school.state} State
                      </span>
                    </div>

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
