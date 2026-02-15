'use client';

import { useViewMode } from '@/lib/context/ViewModeContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isDesktop } = useViewMode();

  if (isDesktop) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-56 min-h-screen p-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <>
      <main className="max-w-md mx-auto min-h-screen pb-20">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
