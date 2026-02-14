'use client';

import { useState } from 'react';

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
  isEmpty?: boolean;
  defaultOpen?: boolean;
}

export default function ReportSection({ title, children, isEmpty = false, defaultOpen = false }: ReportSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
          isEmpty ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900 hover:bg-gray-50'
        }`}
      >
        <span className="font-medium">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-white">
          {isEmpty ? (
            <p className="text-gray-400 italic text-sm">Keine Angabe</p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}
