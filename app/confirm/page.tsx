'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import ConfirmReport from '@/components/ConfirmReport';

export default function ConfirmPage() {
  const router = useRouter();
  const { state } = useReport();

  useEffect(() => {
    if (!state.report) router.push('/');
  }, [state.report, router]);

  if (!state.report) return null;

  return (
    <div className="flex flex-col min-h-screen p-6 animate-slide-right">
      <div className="text-center mb-6 pt-4">
        <h1 className="text-2xl font-bold">
          Bau<span style={{ color: 'var(--accent)' }}>Voice</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Bericht überprüfen
        </p>
      </div>

      <ConfirmReport />
    </div>
  );
}
