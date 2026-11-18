'use client';

import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n/context';
import { isLanguage } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';
import { LogOut, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getNavigationItems } from '@/lib/navigation';

export default function SidebarNavigation() {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t, tr } = useI18n();
  const pathname = usePathname();

  const navItems = getNavigationItems(t, user);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background-secondary border-e border-text-secondary/15 min-h-screen p-4 sticky top-0 overflow-y-auto">
      {/* Brand Logo & Language Switcher */}
      <div className="flex items-center justify-between px-2 py-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 font-bold text-white text-xl">
            ♔
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              Chess<span className="text-accent">Arena</span>
            </h1>
            <p className="text-xs text-text-secondary">{tr('Pro Chess Platform')}</p>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="mb-4 px-2">
        <div className="flex items-center justify-between bg-background-tertiary p-2 rounded-xl border border-text-secondary/10">
          <span className="text-xs text-text-secondary flex items-center gap-1.5 font-medium">
            <Globe className="w-3.5 h-3.5 text-accent" />
            {tr('Lang')}
          </span>
          <select
            value={language}
            onChange={(event) => {
              const selectedLanguage = event.currentTarget.value;
              if (isLanguage(selectedLanguage)) setLanguage(selectedLanguage);
            }}
            className="bg-background text-text-primary text-xs font-semibold rounded-lg px-2 py-1 border border-text-secondary/20 focus:outline-none focus:border-accent"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Session Box */}
      <div className="pt-4 border-t border-text-secondary/15 mt-auto">
        {user ? (
          <div className="bg-background-tertiary rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center flex-shrink-0">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-text-secondary">{tr('ChessArena account')}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title={t('signOut')}
              className="p-2 text-text-secondary hover:text-red-400 transition-colors rounded-lg hover:bg-background"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/auth/login"
              className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center shadow-md shadow-accent/20"
            >
              {t('signIn')}
            </Link>
            <Link
              href="/auth/signup"
              className="w-full py-2.5 bg-background-tertiary hover:bg-background text-text-secondary hover:text-text-primary text-sm font-medium rounded-xl transition-colors flex items-center justify-center border border-text-secondary/15"
            >
              {t('register')}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
