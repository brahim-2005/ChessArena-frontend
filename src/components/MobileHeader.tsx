'use client';

import Link from 'next/link';
import { Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { isLanguage } from '@/lib/i18n/translations';

export function MobileHeader() {
  const { language, setLanguage, tr } = useI18n();

  return (
    <header className="md:hidden bg-background-secondary border-b border-text-secondary/15 p-3 flex items-center justify-between sticky top-0 z-50 gap-2">
      <Link href="/" className="text-lg font-bold text-accent shrink-0">
        ChessArena
      </Link>
      <nav aria-label={tr('Primary navigation')} className="flex items-center gap-1">
        <Link href="/play" className="rounded-lg bg-accent px-2 py-1.5 text-xs font-semibold text-white">
          {tr('Play')}
        </Link>
        <Link href="/learn" className="rounded-lg px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary">
          {tr('Learn')}
        </Link>
        <Link href="/live" className="rounded-lg px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary">
          {tr('Live')}
        </Link>
      </nav>
      <label className="flex items-center gap-1 text-text-secondary">
        <Globe aria-hidden="true" className="h-4 w-4" />
        <span className="sr-only">{tr('Language & Region')}</span>
        <select
          aria-label={tr('Language & Region')}
          value={language}
          onChange={(event) => {
            const selectedLanguage = event.currentTarget.value;
            if (isLanguage(selectedLanguage)) setLanguage(selectedLanguage);
          }}
          className="max-w-20 bg-background text-xs text-text-primary rounded border border-text-secondary/20 px-1 py-1"
        >
          <option value="en">EN</option>
          <option value="fr">FR</option>
          <option value="ar">عربي</option>
        </select>
      </label>
    </header>
  );
}

export function SiteFooter() {
  const { tr } = useI18n();

  return (
    <footer className="bg-background-secondary border-t border-text-secondary/15 py-6 px-4 text-center text-text-secondary text-sm">
      <p>&copy; 2026 ChessArena. {tr('Inspired by Chess.com & Lichess. All rights reserved.')}</p>
    </footer>
  );
}
