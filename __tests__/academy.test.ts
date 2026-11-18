import {
  ACADEMY_DIFFICULTY_COUNTS,
  ACADEMY_PASSING_SCORE,
  scoreAcademyQuiz,
  validateAcademyQuiz,
} from '../src/lib/learning/academy';
import { getLevel1Lessons, getLevel1Quiz } from '../src/lib/learning/level1';

describe('Academy Level 1 curriculum', () => {
  it('contains ten complete lessons with twenty localized questions and the required difficulty split', () => {
    const lessons = getLevel1Lessons();
    expect(lessons).toHaveLength(10);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(10);

    for (const lesson of lessons) {
      const questions = getLevel1Quiz(lesson.id);
      expect(questions).toHaveLength(20);
      expect(validateAcademyQuiz(questions)).toEqual([]);
      expect(new Set(questions.map((question) => question.prompt.en)).size).toBe(20);
      expect(lesson.sections).toHaveLength(5);
      expect(lesson.terminology).toHaveLength(5);
      expect(lesson.commonMistakes).toHaveLength(5);

      const difficultyCounts = questions.reduce(
        (counts, question) => {
          counts[question.difficulty] += 1;
          return counts;
        },
        { easy: 0, medium: 0, hard: 0 }
      );
      expect(difficultyCounts).toEqual(ACADEMY_DIFFICULTY_COUNTS);
    }

    const allQuestionIds = lessons.flatMap((lesson) => getLevel1Quiz(lesson.id).map((question) => question.id));
    expect(new Set(allQuestionIds).size).toBe(200);
  });

  it('scores all responses, difficulty performance, and the 75 percent passing threshold', () => {
    const questions = getLevel1Quiz('l1-01');
    const passingAnswers = Object.fromEntries(
      questions.map((question, index) => [
        question.id,
        index < ACADEMY_PASSING_SCORE ? question.correctAnswer : question.choices.find(
          (choice) => choice.id !== question.correctAnswer
        )?.id ?? '',
      ])
    );

    const result = scoreAcademyQuiz(questions, passingAnswers);
    expect(result.score).toBe(15);
    expect(result.percentage).toBe(75);
    expect(result.passed).toBe(true);
    expect(result.byDifficulty.easy.total).toBe(5);
    expect(result.byDifficulty.medium.total).toBe(10);
    expect(result.byDifficulty.hard.total).toBe(5);
  });

  it('rejects incomplete or extra answer sets', () => {
    const questions = getLevel1Quiz('l1-02');
    expect(() => scoreAcademyQuiz(questions, {})).toThrow('Every quiz question must have exactly one submitted answer.');
    expect(() => scoreAcademyQuiz(questions, { ...Object.fromEntries(
      questions.map((question) => [question.id, question.correctAnswer])
    ), extra: 'a' })).toThrow('Every quiz question must have exactly one submitted answer.');
  });
});
