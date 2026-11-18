import { Chess } from 'chess.js';
import type { Language } from '@/lib/i18n/translations';

export const ACADEMY_LESSONS_PER_LEVEL = 10;
export const ACADEMY_QUESTIONS_PER_LESSON = 20;
export const ACADEMY_PASSING_SCORE = 15;
export const ACADEMY_DIFFICULTY_COUNTS = {
  easy: 5,
  medium: 10,
  hard: 5,
} as const;

export const ACADEMY_LEVELS = [
  { number: 1, id: 'foundations', title: 'Chess Foundations' },
  { number: 2, id: 'tactics', title: 'Tactical Skills' },
  { number: 3, id: 'strategy', title: 'Strategic Chess' },
  { number: 4, id: 'advanced', title: 'Advanced Chess' },
] as const;

export type AcademyDifficulty = keyof typeof ACADEMY_DIFFICULTY_COUNTS;
export type AcademyQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'best_move'
  | 'identify_mistake'
  | 'find_checkmate'
  | 'interactive_board'
  | 'complete_move'
  | 'position_evaluation'
  | 'strategic_decision';

export type LocalizedText = Record<Language, string>;

export interface AcademyChoice {
  id: string;
  label: LocalizedText;
}

export interface AcademyQuestion {
  id: string;
  lessonId: string;
  questionNumber: number;
  difficulty: AcademyDifficulty;
  type: AcademyQuestionType;
  prompt: LocalizedText;
  choices: AcademyChoice[];
  correctAnswer: string;
  explanation: LocalizedText;
  hint?: LocalizedText;
  fen?: string;
  solutionMoves?: string[];
}

export interface AcademyQuizResult {
  score: number;
  percentage: number;
  passed: boolean;
  byDifficulty: Record<AcademyDifficulty, { correct: number; total: number }>;
}

const REQUIRED_LANGUAGES: Language[] = ['en', 'fr', 'ar'];

export function validateAcademyQuiz(questions: AcademyQuestion[]): string[] {
  const errors: string[] = [];
  if (questions.length !== ACADEMY_QUESTIONS_PER_LESSON) {
    errors.push(`Expected exactly ${ACADEMY_QUESTIONS_PER_LESSON} questions; got ${questions.length}.`);
  }

  const ids = new Set<string>();
  const questionNumbers = new Set<number>();
  const difficultyCounts: Record<AcademyDifficulty, number> = { easy: 0, medium: 0, hard: 0 };

  for (const question of questions) {
    if (ids.has(question.id)) errors.push(`Duplicate question ID: ${question.id}.`);
    ids.add(question.id);
    if (questionNumbers.has(question.questionNumber)) {
      errors.push(`Duplicate question number: ${question.questionNumber}.`);
    }
    questionNumbers.add(question.questionNumber);
    difficultyCounts[question.difficulty] += 1;

    if (!question.choices.some((choice) => choice.id === question.correctAnswer)) {
      errors.push(`Question ${question.id} has no matching correct choice.`);
    }
    if (new Set(question.choices.map((choice) => choice.id)).size !== question.choices.length) {
      errors.push(`Question ${question.id} has duplicate choice IDs.`);
    }

    for (const language of REQUIRED_LANGUAGES) {
      if (!question.prompt[language]?.trim()) errors.push(`Question ${question.id} is missing ${language} prompt.`);
      if (!question.explanation[language]?.trim()) errors.push(`Question ${question.id} is missing ${language} explanation.`);
      if (question.choices.some((choice) => !choice.label[language]?.trim())) {
        errors.push(`Question ${question.id} is missing ${language} choice text.`);
      }
    }

    if (question.fen || question.solutionMoves?.length) {
      if (!question.fen || !question.solutionMoves?.length) {
        errors.push(`Question ${question.id} needs both a FEN and solution moves.`);
        continue;
      }
      try {
        const chess = new Chess(question.fen);
        for (const move of question.solutionMoves) chess.move(move);
      } catch {
        errors.push(`Question ${question.id} has an illegal chess solution.`);
      }
    }
  }

  for (const [difficulty, expected] of Object.entries(ACADEMY_DIFFICULTY_COUNTS) as [AcademyDifficulty, number][]) {
    if (difficultyCounts[difficulty] !== expected) {
      errors.push(`Expected ${expected} ${difficulty} questions; got ${difficultyCounts[difficulty]}.`);
    }
  }

  return errors;
}

export function scoreAcademyQuiz(
  questions: AcademyQuestion[],
  answers: Record<string, string>
): AcademyQuizResult {
  const questionIds = new Set(questions.map((question) => question.id));
  if (
    questions.length !== ACADEMY_QUESTIONS_PER_LESSON ||
    Object.keys(answers).length !== questionIds.size ||
    Object.keys(answers).some((questionId) => !questionIds.has(questionId))
  ) {
    throw new Error('Every quiz question must have exactly one submitted answer.');
  }

  const byDifficulty: AcademyQuizResult['byDifficulty'] = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };
  let score = 0;

  for (const question of questions) {
    byDifficulty[question.difficulty].total += 1;
    if (answers[question.id] === question.correctAnswer) {
      score += 1;
      byDifficulty[question.difficulty].correct += 1;
    }
  }

  return {
    score,
    percentage: score * 5,
    passed: score >= ACADEMY_PASSING_SCORE,
    byDifficulty,
  };
}
