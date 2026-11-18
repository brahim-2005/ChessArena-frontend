import { getLesson, getLessons } from '../src/lib/learning/lessons';

describe('localized learning lessons', () => {
  it('provides complete localized lesson content in English, French, and Arabic', () => {
    const english = getLessons('en');
    const french = getLessons('fr');
    const arabic = getLessons('ar');

    expect(french.map((lesson) => lesson.id)).toEqual(english.map((lesson) => lesson.id));
    expect(arabic.map((lesson) => lesson.id)).toEqual(english.map((lesson) => lesson.id));
    expect(french.every((lesson) => lesson.content.length > 0 && lesson.title !== english.find((item) => item.id === lesson.id)?.title)).toBe(true);
    expect(arabic.every((lesson) => lesson.content.length > 0 && lesson.title !== english.find((item) => item.id === lesson.id)?.title)).toBe(true);
  });

  it('opens lessons by their own id instead of falling back to lesson one', () => {
    const frenchLesson = getLesson('6', 'fr');
    const arabicLesson = getLesson('4', 'ar');

    expect(frenchLesson?.title).toBe('Les finales de rois et de pions');
    expect(frenchLesson?.content[0]).toContain('finales');
    expect(arabicLesson?.title).toBe('التكتيكات: الشوكة والتثبيت والسيخ');
    expect(getLesson('unknown', 'en')).toBeUndefined();
  });
});
