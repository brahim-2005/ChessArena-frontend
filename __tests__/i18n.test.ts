import { translateText } from '../src/lib/i18n/translations';

describe('translateText', () => {
  it('translates shared interface text to Arabic', () => {
    expect(translateText('ar', 'Welcome to')).toBe('مرحباً بك في');
    expect(translateText('ar', 'Play Chess')).toBe('العب الشطرنج');
  });

  it('translates dynamic club notices while preserving the club name', () => {
    expect(translateText('ar', 'Club “Rabat Knights” created.')).toBe('تم إنشاء النادي «Rabat Knights».');
  });

  it('keeps English copy unchanged', () => {
    expect(translateText('en', 'Welcome to')).toBe('Welcome to');
  });
});
