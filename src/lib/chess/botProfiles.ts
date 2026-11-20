import type { TranslationKey } from '@/lib/i18n/translations';

export type BotFormat = 'bullet' | 'blitz' | 'rapid' | 'classical';
export type BotProfileId =
  | 'beginner'
  | 'easy'
  | 'casual'
  | 'club'
  | 'advanced'
  | 'expert'
  | 'master'
  | 'grandmaster'
  | 'super-grandmaster';

export interface BotProfile {
  id: BotProfileId;
  elo: number;
  avatar: string;
  skillLevel: number;
}

export const BOT_PROFILE_NAME_KEYS: Readonly<Record<BotProfileId, TranslationKey>> = {
  beginner: 'botLevelBeginner',
  easy: 'botLevelEasy',
  casual: 'botLevelCasual',
  club: 'botLevelClub',
  advanced: 'botLevelAdvanced',
  expert: 'botLevelExpert',
  master: 'botLevelMaster',
  grandmaster: 'botLevelGrandmaster',
  'super-grandmaster': 'botLevelSuperGrandmaster',
};

export const BOT_PROFILE_DESCRIPTION_KEYS: Readonly<Record<BotProfileId, TranslationKey>> = {
  beginner: 'botLevelBeginnerDescription',
  easy: 'botLevelEasyDescription',
  casual: 'botLevelCasualDescription',
  club: 'botLevelClubDescription',
  advanced: 'botLevelAdvancedDescription',
  expert: 'botLevelExpertDescription',
  master: 'botLevelMasterDescription',
  grandmaster: 'botLevelGrandmasterDescription',
  'super-grandmaster': 'botLevelSuperGrandmasterDescription',
};

export const BOT_PROFILES: readonly BotProfile[] = [
  { id: 'beginner', elo: 400, avatar: '🌱', skillLevel: 0 },
  { id: 'easy', elo: 700, avatar: '🧩', skillLevel: 1 },
  { id: 'casual', elo: 1000, avatar: '♟️', skillLevel: 3 },
  { id: 'club', elo: 1300, avatar: '🛡️', skillLevel: 6 },
  { id: 'advanced', elo: 1600, avatar: '🎯', skillLevel: 20 },
  { id: 'expert', elo: 1900, avatar: '⚔️', skillLevel: 20 },
  { id: 'master', elo: 2200, avatar: '👑', skillLevel: 20 },
  { id: 'grandmaster', elo: 2600, avatar: '🏆', skillLevel: 20 },
  { id: 'super-grandmaster', elo: 3000, avatar: '💎', skillLevel: 20 },
];

export const BOT_TIME_CONTROLS: Readonly<Record<BotFormat, readonly string[]>> = {
  bullet: ['1+0', '2+1'],
  blitz: ['3+0', '3+2', '5+0'],
  rapid: ['10+0', '10+5', '15+10'],
  classical: ['30+0', '30+20'],
};

export interface UciOption {
  name: string;
  min?: number;
  max?: number;
}

export interface BotUciSettings {
  limitStrength: boolean;
  elo: number | null;
  skillLevel: number;
}

export function getBotProfile(id: string | null | undefined): BotProfile | undefined {
  return BOT_PROFILES.find((profile) => profile.id === id);
}

export function parseUciOption(line: string): UciOption | null {
  const match = /^option name (.+?) type \w+(.*)$/.exec(line);
  if (!match) return null;

  const option: UciOption = { name: match[1] };
  const min = /\bmin (-?\d+)\b/.exec(match[2]);
  const max = /\bmax (-?\d+)\b/.exec(match[2]);
  if (min) option.min = Number(min[1]);
  if (max) option.max = Number(max[1]);
  return option;
}

export function getBotUciSettings(
  profile: BotProfile,
  availableOptions: readonly UciOption[],
): BotUciSettings {
  const eloOption = availableOptions.find((option) => option.name === 'UCI_Elo');
  const canLimitToElo = profile.id !== 'super-grandmaster'
    && Boolean(eloOption)
    && profile.elo >= (eloOption?.min ?? 1320)
    && profile.elo <= (eloOption?.max ?? 3190);

  return {
    limitStrength: canLimitToElo,
    elo: canLimitToElo ? profile.elo : null,
    skillLevel: canLimitToElo ? 20 : profile.skillLevel,
  };
}

export function getBotThinkingTimeMs(profile: BotProfile, format: BotFormat): number {
  const timeByFormat: Record<BotFormat, number> = {
    bullet: 160,
    blitz: 400,
    rapid: 900,
    classical: 1800,
  };
  const strengthFactor = profile.elo < 1000 ? 0.65 : profile.elo < 1600 ? 0.8 : 1;
  return Math.round(timeByFormat[format] * strengthFactor);
}
