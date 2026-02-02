import {GameState} from './types';

// Check if all win conditions are met
export function checkWinCondition(state: GameState): boolean {
  const {grid, paths, puzzle} = state;

  // 1. All paths must be complete (both endpoints connected)
  for (const path of paths.values()) {
    if (!path.isComplete) {
      return false;
    }
  }

  // 2. All cells must be filled
  for (let row = 0; row < puzzle.size; row++) {
    for (let col = 0; col < puzzle.size; col++) {
      if (grid[row][col].pathId === null) {
        return false;
      }
    }
  }

  // 3. No overlapping paths (implicit - enforced during path drawing)

  return true;
}

// Get completion statistics
export function getCompletionStats(state: GameState): {
  pathsComplete: number;
  totalPaths: number;
  cellsFilled: number;
  totalCells: number;
  percentComplete: number;
} {
  const {grid, paths, puzzle} = state;

  const totalPaths = paths.size;
  let pathsComplete = 0;
  for (const path of paths.values()) {
    if (path.isComplete) {
      pathsComplete++;
    }
  }

  const totalCells = puzzle.size * puzzle.size;
  let cellsFilled = 0;
  for (let row = 0; row < puzzle.size; row++) {
    for (let col = 0; col < puzzle.size; col++) {
      if (grid[row][col].pathId !== null) {
        cellsFilled++;
      }
    }
  }

  const percentComplete = Math.round(
    ((pathsComplete / totalPaths) * 0.5 + (cellsFilled / totalCells) * 0.5) * 100,
  );

  return {
    pathsComplete,
    totalPaths,
    cellsFilled,
    totalCells,
    percentComplete,
  };
}
