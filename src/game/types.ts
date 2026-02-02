// Core game types for LinkedIn Zip clone

export interface Position {
  row: number;
  col: number;
}

export interface Cell {
  row: number;
  col: number;
  value: number | null; // null for empty, number for endpoints (1, 2, 3, etc.)
  pathId: number | null; // which path occupies this cell
}

export interface Endpoint {
  id: number;
  positions: [Position, Position]; // pair of positions for each numbered endpoint
}

export interface Path {
  id: number;
  color: string;
  cells: Position[];
  isComplete: boolean;
}

export interface Puzzle {
  size: number;
  endpoints: Endpoint[];
  solution?: Path[]; // optional solution for validation
}

export interface GameState {
  puzzle: Puzzle;
  grid: Cell[][];
  paths: Map<number, Path>;
  currentPathId: number | null;
  isDrawing: boolean;
  isComplete: boolean;
  moveCount: number;
}

// Actions for game state reducer
export type GameAction =
  | { type: 'START_PATH'; pathId: number; position: Position }
  | { type: 'EXTEND_PATH'; position: Position }
  | { type: 'END_DRAWING' }
  | { type: 'CLEAR_PATH'; pathId: number }
  | { type: 'RESET_PUZZLE' }
  | { type: 'SET_PUZZLE'; puzzle: Puzzle }
  | { type: 'SET_COMPLETE' };

// Direction helpers
export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTIONS: Record<Direction, Position> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

// Difficulty levels
export interface DifficultyConfig {
  gridSize: number;
  numPaths: number;
  name: string;
}

export const DIFFICULTIES: DifficultyConfig[] = [
  { gridSize: 5, numPaths: 4, name: 'Easy' },
  { gridSize: 6, numPaths: 5, name: 'Medium' },
  { gridSize: 7, numPaths: 6, name: 'Hard' },
  { gridSize: 8, numPaths: 7, name: 'Expert' },
  { gridSize: 9, numPaths: 8, name: 'Master' },
];
