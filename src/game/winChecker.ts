import {GameState} from './types';

// Check if all win conditions are met
export function checkWinCondition(state: GameState): boolean {
  const {grid, path, puzzle, nextCheckpoint} = state;
  const totalCells = puzzle.size * puzzle.size;
  const totalCheckpoints = puzzle.checkpoints.length;

  // 1. Path must fill all cells
  if (path.length !== totalCells) {
    return false;
  }

  // 2. All checkpoints must have been visited (nextCheckpoint should be past the last one)
  if (nextCheckpoint <= totalCheckpoints) {
    return false;
  }

  return true;
}

// Get completion statistics for the sequential path game
export function getCompletionStats(state: GameState): {
  checkpointsVisited: number;
  totalCheckpoints: number;
  cellsFilled: number;
  totalCells: number;
  percentComplete: number;
} {
  const {puzzle, path, nextCheckpoint} = state;

  const totalCheckpoints = puzzle.checkpoints.length;
  // nextCheckpoint is 1-indexed; if nextCheckpoint is 3, we've visited 1 and 2 (so 2 checkpoints)
  const checkpointsVisited = Math.max(0, nextCheckpoint - 1);

  const totalCells = puzzle.size * puzzle.size;
  const cellsFilled = path.length;

  // Calculate percent as weighted average of checkpoints and cells
  const checkpointProgress = checkpointsVisited / totalCheckpoints;
  const cellProgress = cellsFilled / totalCells;
  const percentComplete = Math.round((checkpointProgress * 0.3 + cellProgress * 0.7) * 100);

  return {
    checkpointsVisited,
    totalCheckpoints,
    cellsFilled,
    totalCells,
    percentComplete,
  };
}
