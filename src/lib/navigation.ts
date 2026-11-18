import type { User } from '@supabase/supabase-js';
import {
  Award,
  BookOpen,
  Home,
  Play,
  Puzzle,
  Radio,
  Settings,
  Trophy,
  User as UserIcon,
  Users,
  UsersRound,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { TranslationKey } from '@/lib/i18n/translations';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export function getNavigationItems(
  t: (key: TranslationKey) => string,
  user: User | null
): NavigationItem[] {
  return [
    { name: t('home'), href: '/', icon: Home },
    { name: t('play'), href: '/play', icon: Play },
    { name: t('puzzles'), href: '/puzzles', icon: Puzzle },
    { name: t('learn'), href: '/learn', icon: BookOpen },
    { name: t('compete'), href: '/tournaments', icon: Trophy },
    { name: t('live'), href: '/live', icon: Radio },
    { name: t('sessions'), href: '/sessions', icon: Video },
    { name: t('clubs'), href: '/clubs', icon: UsersRound },
    { name: t('leaderboard'), href: '/leaderboard', icon: Award },
    { name: t('community'), href: '/social', icon: Users },
    {
      name: t('profile'),
      href: user
        ? `/profile/${encodeURIComponent(String(user.user_metadata.username || user.email?.split('@')[0] || ''))}`
        : '/auth/login',
      icon: UserIcon,
    },
    { name: t('settings'), href: '/settings', icon: Settings },
  ];
}
