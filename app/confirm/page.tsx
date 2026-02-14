'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import ConfirmReport from '@/components/ConfirmReport';

export default function ConfirmPage() {
  const router = useRouter();
  const { state } = useReport();

  useEffect(() => {
    if (!state.report) {
      router.push('/');
    }
  }, [state.report, router]);

  if (!state.report) return null;

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="text-center mb-6 pt-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Bau<span className="text-green-500">Voice</span>
        </h1>
        <p className="text-gray-500 mt-1">Bericht überprüfen</p>
      </div>

      <ConfirmReport />
    </div>
  );
}
