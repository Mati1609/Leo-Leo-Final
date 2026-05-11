/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeneratedQuestion } from './services/geminiService';

export type AppView = 'registration' | 'map' | 'lesson' | 'shop' | 'progress' | 'parents';

export interface AvatarConfig {
  emoji: string;
  color: string;
  accessory: string;
}

export interface UserProfile {
  name: string;
  lastName: string;
  age: number;
  grade: string;
  parentEmail: string;
  avatar: AvatarConfig;
}

export interface CategoryProgress {
  lenguaje: number;
  matematicas: number;
  historia: number;
  ciencias: number;
}

export interface LessonState {
  questions: GeneratedQuestion[] | null;
  currentQuestionIndex: number;
  questionStep: boolean;
  selectedOption: string | null;
  feedback: 'correct' | 'incorrect' | null;
  hasMistake: boolean;
  isFinished: boolean;
}

export interface Stats {
  screenTime: number; // in seconds
  readingTime: number; // in seconds
  answers: {
    lenguaje: { correct: number; total: number; };
    matematicas: { correct: number; total: number; };
    historia: { correct: number; total: number; };
    ciencias: { correct: number; total: number; };
  }
}

export interface AppState {
  view: AppView;
  user: UserProfile | null;
  coins: number;
  progress: number; // overall percentage
  categoryProgress: CategoryProgress;
  activeCategory: 'lenguaje' | 'matematicas' | 'historia' | 'ciencias' | null;
  returnToView?: AppView | null;
  lessonState?: LessonState | null;
  stats: Stats;
}
