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
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors"
        style={{
          backgroundColor: isEmpty ? 'transparent' : 'var(--bg-surface)',
          color: isEmpty ? 'var(--text-tertiary)' : 'var(--text-primary)',
        }}
      >
        <span className="font-medium text-sm">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-tertiary)' }}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
          {isEmpty ? (
            <p className="italic text-xs" style={{ color: 'var(--text-tertiary)' }}>Keine Angabe</p>
          ) : children}
        </div>
      )}
    </div>
  );
}
