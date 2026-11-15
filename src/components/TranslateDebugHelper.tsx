'use client';

import { useI18n } from '@/lib/i18n/context';

export default function TranslateDebugHelper() {
  const { language } = useI18n();
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-accent text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
      🌐 {language.toUpperCase()}
    </div>
  );
}
