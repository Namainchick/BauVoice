'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useViewMode } from '@/lib/context/ViewModeContext';

const NAV_ITEMS = [
  {
    key: 'berichte',
    label: 'Berichte',
    href: '/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'neu',
    label: 'Neuer Bericht',
    href: '/neu',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path
          d="M12 5v14m-7-7h14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { viewMode, setViewMode } = useViewMode();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isForceMobile = viewMode === 'force-mobile';

  return (
    <nav
      className="fixed left-0 top-0 bottom-0 w-56 flex flex-col z-50"
      style={{ backgroundColor: 'var(--nav-bg)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <span className="text-xl font-bold">
          <span className="text-white">Bau</span>
          <span style={{ color: '#29FFBF' }}>Voice</span>
        </span>
      </div>

      {/* Search button */}
      <div className="px-3 mb-2">
        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
          style={{ color: 'var(--nav-text)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Suche
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }} />

      {/* Main nav items */}
      <div className="flex-1 flex flex-col px-3 gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
              style={{
                color: active ? '#FFFFFF' : 'var(--nav-text)',
                backgroundColor: active ? 'rgba(41, 255, 191, 0.1)' : 'transparent',
                borderLeft: active ? '3px solid #29FFBF' : '3px solid transparent',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="px-3 pb-5 flex flex-col gap-1">
        {/* Divider */}
        <div className="mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }} />

        {/* Einstellungen */}
        <button
          onClick={() => router.push('/settings')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
          style={{
            color: isActive('/settings') ? '#FFFFFF' : 'var(--nav-text)',
            backgroundColor: isActive('/settings') ? 'rgba(41, 255, 191, 0.1)' : 'transparent',
            borderLeft: isActive('/settings') ? '3px solid #29FFBF' : '3px solid transparent',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path
              d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-1.415 3.417 2 2 0 01-1.415-.587l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 8.82a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Einstellungen
        </button>

        {/* Mobile Ansicht toggle */}
        <button
          onClick={() => setViewMode(viewMode === 'force-mobile' ? 'auto' : 'force-mobile')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left hover:bg-white/5"
          style={{
            color: isForceMobile ? '#29FFBF' : 'var(--nav-text)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <rect
              x="7"
              y="2"
              width="10"
              height="20"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M11 18h2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Mobile Ansicht
        </button>
      </div>
    </nav>
  );
}
