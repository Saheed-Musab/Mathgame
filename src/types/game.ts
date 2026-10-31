export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameState = 'welcome' | 'playing' | 'paused' | 'gameover';

export type GameMode = 'target-sum' | 'equation-builder' | 'grid-sprint';

export interface TileItem {
  id: string;
  value: number;
  isSelected: boolean;
  isHinted?: boolean;
}

export interface Challenge {
  id: number;
  target: number;
  tiles: TileItem[];
  solutionIds: string[];
}

export interface EquationChallenge {
  id: number;
  target: number;
  numbers: number[];
  operators: string[];
}

export interface GridSprintPrompt {
  id: number;
  instruction: string;
  targetValues: number[];
  gridNumbers: Array<{ id: string; value: number; isTarget: boolean; isTapped: boolean }>;
}

export interface GameStats {
  score: number;
  solvedCount: number;
  wrongAttempts: number;
  currentStreak: number;
  bestStreak: number;
}

export interface HighScoreRecord {
  easy: number;
  medium: number;
  hard: number;
}
