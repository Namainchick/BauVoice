import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReportProvider } from '@/lib/context/ReportContext';

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
      <body className={`${inter.className} bg-white text-gray-900 min-h-screen`}>
        <ReportProvider>
          <main className="max-w-md mx-auto min-h-screen">
            {children}
          </main>
        </ReportProvider>
      </body>
    </html>
  );
}
