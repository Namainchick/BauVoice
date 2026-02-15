import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReportProvider } from '@/lib/context/ReportContext';
import { ViewModeProvider } from '@/lib/context/ViewModeContext';
import AppShell from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BauVoice – KI-Sprachassistent für Baustellenberichte',
  description: 'Sprich einfach drauf los – BauVoice erledigt den Rest.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <ReportProvider>
          <ViewModeProvider>
            <AppShell>
              {children}
            </AppShell>
          </ViewModeProvider>
        </ReportProvider>
      </body>
    </html>
  );
}
