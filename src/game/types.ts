// Core game types for LinkedIn Zip clone
// This is a sequential path puzzle: draw ONE path visiting 1→2→3→...→N filling all cells

export interface Position {
  row: number;
  col: number;
}

export interface Cell {
  row: number;
  col: number;
  value: number | null; // null for empty, number for checkpoints (1, 2, 3, etc.)
  isOnPath: boolean; // whether this cell is part of the current path
}

// A checkpoint is a numbered position the path must visit in order
export interface Checkpoint {
  number: number; // 1, 2, 3, etc.
  position: Position;
}

export interface Puzzle {
  size: number;
  checkpoints: Checkpoint[]; // ordered list of checkpoints 1 to N
  solution?: Position[]; // optional solution path for validation
}

export interface GameState {
  puzzle: Puzzle;
  grid: Cell[][];
  path: Position[]; // the single path being drawn
  nextCheckpoint: number; // which checkpoint number we need to reach next (starts at 1)
  isDrawing: boolean;
  isComplete: boolean;
  moveCount: number;
  startTime: number | null; // timestamp when puzzle started
  endTime: number | null; // timestamp when puzzle completed
}

// Actions for game state reducer
export type GameAction =
  | {type: 'START_PATH'; position: Position}
  | {type: 'EXTEND_PATH'; position: Position}
  | {type: 'END_DRAWING'}
  | {type: 'CLEAR_PATH'}
  | {type: 'RESET_PUZZLE'}
  | {type: 'SET_PUZZLE'; puzzle: Puzzle}
  | {type: 'SET_COMPLETE'}
  | {type: 'UNDO'};

// Direction helpers
export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTIONS: Record<Direction, Position> = {
  up: {row: -1, col: 0},
  down: {row: 1, col: 0},
  left: {row: 0, col: -1},
  right: {row: 0, col: 1},
};

// Difficulty levels
export interface DifficultyConfig {
  gridSize: number;
  numCheckpoints: number;
  name: string;
}

export const DIFFICULTIES: DifficultyConfig[] = [
  {gridSize: 5, numCheckpoints: 6, name: 'Easy'},
  {gridSize: 6, numCheckpoints: 8, name: 'Medium'},
  {gridSize: 7, numCheckpoints: 10, name: 'Hard'},
  {gridSize: 8, numCheckpoints: 12, name: 'Expert'},
  {gridSize: 9, numCheckpoints: 14, name: 'Master'},
];

// Legacy types for compatibility during transition
export interface Endpoint {
  id: number;
  positions: [Position, Position];
}

export interface Path {
  id: number;
  color: string;
  cells: Position[];
  isComplete: boolean;
}
