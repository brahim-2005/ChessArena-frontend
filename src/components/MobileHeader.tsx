'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n/context';
import { isLanguage } from '@/lib/i18n/translations';
import { getNavigationItems } from '@/lib/navigation';

export function MobileHeader() {
  const { user, loading, signOut } = useAuth();
  const { language, setLanguage, t, tr } = useI18n();
  const pathname = usePathname() ?? '';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navItems = getNavigationItems(t, user);
  const profileHref = navItems.find((item) => item.name === t('profile'))?.href ?? '/auth/login';

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-text-secondary/15 bg-background-secondary p-3 md:hidden">
        <Link href="/" className="shrink-0 text-lg font-bold text-accent">
          ChessArena
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          {!loading && (
            <Link
              href={user ? profileHref : '/auth/login'}
              className="max-w-24 truncate rounded-lg bg-background-tertiary px-2.5 py-2 text-xs font-semibold text-text-primary"
            >
              {user ? t('profile') : t('signIn')}
            </Link>
          )}
          <label className="flex items-center gap-1 text-text-secondary">
            <Globe aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="sr-only">{t('language')}</span>
            <select
              aria-label={t('language')}
              value={language}
              onChange={(event) => {
                const selectedLanguage = event.currentTarget.value;
                if (isLanguage(selectedLanguage)) setLanguage(selectedLanguage);
              }}
              className="max-w-16 rounded border border-text-secondary/20 bg-background px-1 py-1 text-xs text-text-primary"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="ar">عربي</option>
            </select>
          </label>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={t('openMenu')}
            aria-controls="mobile-site-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-text-secondary/20 text-text-primary hover:bg-background-tertiary"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label={t('closeMenu')}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/60"
          />
          <aside
            id="mobile-site-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={t('siteNavigation')}
            className="absolute inset-y-0 start-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto border-e border-text-secondary/15 bg-background-secondary p-4 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between border-b border-text-secondary/15 pb-4">
              <Link href="/" className="text-lg font-bold text-accent" onClick={() => setMenuOpen(false)}>
                ChessArena
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={t('closeMenu')}
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-text-secondary/20 text-text-primary hover:bg-background-tertiary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label={t('siteNavigation')} className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href
                  || (item.href !== '/' && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-text-secondary/15 pt-4">
              {user ? (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-background-tertiary p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {user.user_metadata.username || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-text-secondary">{tr('ChessArena account')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      void signOut();
                    }}
                    className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('signOut')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl bg-accent px-3 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    {t('signIn')}
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-text-secondary/20 bg-background-tertiary px-3 py-2.5 text-center text-sm font-semibold text-text-primary"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
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
