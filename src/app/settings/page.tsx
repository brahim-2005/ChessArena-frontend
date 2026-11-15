'use client';

import { useI18n } from '@/lib/i18n/context';
import { Globe, ShieldCheck, Volume2, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-text-primary">
      <header className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">{t('settingsTitle')}</h1>
        <p className="mt-1 text-text-secondary">Customize your language preference, board themes, and sound settings.</p>
      </header>

      <div className="space-y-6">
        {/* Language Settings */}
        <div className="bg-background-secondary rounded-2xl p-6 border border-text-secondary/15 shadow-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            Language & Region (اللغة والمنطقة)
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Select your preferred platform language. ChessArena instantly translates all menus, pages, and components.
          </p>
          <div className="max-w-xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              {t('language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full rounded-xl border border-text-secondary/20 bg-background-tertiary px-4 py-3 text-text-primary font-semibold"
            >
              <option value="en">English (LTR)</option>
              <option value="fr">Français (LTR)</option>
              <option value="ar">العربية (RTL)</option>
            </select>
          </div>
        </div>

        {/* Board & Audio Preferences */}
        <div className="bg-background-secondary rounded-2xl p-6 border border-text-secondary/15 shadow-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-accent" />
            Board & Sound Preferences
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-background-tertiary rounded-xl border border-text-secondary/10">
              <span className="text-sm font-medium">Enable Move Sounds</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-accent" />
            </label>
            <label className="flex items-center justify-between p-3 bg-background-tertiary rounded-xl border border-text-secondary/10">
              <span className="text-sm font-medium">Dark Mode Appearance</span>
              <input type="checkbox" defaultChecked disabled className="w-4 h-4 accent-accent" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
