import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return fallback;
}

export function formatTime(seconds: number): string {
  if (seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getCurrentTimeMs(): number {
  return Date.now();
}

export function parseTimeControl(control: string): { initial: number; increment: number } {
  const match = /^(\d{1,3})\+(\d{1,3})$/.exec(control);
  if (!match) {
    throw new Error('Invalid time control.');
  }

  const minutes = Number(match[1]);
  const increment = Number(match[2]);
  if (minutes < 1 || minutes > 180 || increment > 180) {
    throw new Error('Time control is outside the supported range.');
  }

  return {
    initial: minutes * 60,
    increment,
  };
}