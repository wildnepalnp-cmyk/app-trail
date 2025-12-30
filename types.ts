export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  category?: string;
  isTricky?: boolean;
}

export enum AppState {
  HOME = 'HOME',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answers: { questionId: number; selectedOption: number; isCorrect: boolean }[];
  timeLeft: number;
}