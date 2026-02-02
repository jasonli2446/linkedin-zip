import {Position, GameState, DIRECTIONS, Direction} from './types';
import {positionsEqual, areAdjacent} from './gameState';

// Check if a position is within grid bounds
export function isInBounds(position: Position, size: number): boolean {
  return (
    position.row >= 0 &&
    position.row < size &&
    position.col >= 0 &&
    position.col < size
  );
}

// Get all adjacent positions
export function getAdjacentPositions(position: Position): Position[] {
  return Object.values(DIRECTIONS).map(dir => ({
    row: position.row + dir.row,
    col: position.col + dir.col,
  }));
}

// Check if a move is valid for path extension
export function isValidMove(
  state: GameState,
  from: Position,
  to: Position,
): boolean {
  const {grid, puzzle, currentPathId, paths} = state;

  if (!currentPathId) return false;

  // Must be adjacent
  if (!areAdjacent(from, to)) return false;

  // Must be in bounds
  if (!isInBounds(to, puzzle.size)) return false;

  const targetCell = grid[to.row][to.col];
  const path = paths.get(currentPathId);

  if (!path) return false;

  // Check if backtracking is allowed
  if (path.cells.length >= 2) {
    const secondLast = path.cells[path.cells.length - 2];
    if (positionsEqual(secondLast, to)) {
      return true; // Backtracking is always allowed
    }
  }

  // Cell already occupied by different path
  if (targetCell.pathId !== null && targetCell.pathId !== currentPathId) {
    return false;
  }

  // Cell already in current path (no loops)
  if (path.cells.some(c => positionsEqual(c, to))) {
    return false;
  }

  // If target is an endpoint, must be matching endpoint
  if (targetCell.value !== null && targetCell.value !== currentPathId) {
    return false;
  }

  return true;
}

// Check if a path can start from a position
export function canStartPathFrom(
  state: GameState,
  position: Position,
): number | null {
  const {grid, puzzle} = state;
  const cell = grid[position.row][position.col];

  // Must be an endpoint cell
  if (cell.value === null) return null;

  // Find which endpoint this belongs to
  for (const endpoint of puzzle.endpoints) {
    for (const pos of endpoint.positions) {
      if (positionsEqual(pos, position)) {
        return endpoint.id;
      }
    }
  }

  return null;
}

// Check if current path can complete at a position
export function canCompletePathAt(
  state: GameState,
  position: Position,
): boolean {
  const {currentPathId, puzzle, paths} = state;

  if (!currentPathId) return false;

  const path = paths.get(currentPathId);
  if (!path || path.cells.length === 0) return false;

  // Find matching endpoint
  const endpoint = puzzle.endpoints.find(e => e.id === currentPathId);
  if (!endpoint) return false;

  // Must be at the other endpoint (not the start)
  const startPos = path.cells[0];
  const endPositions = endpoint.positions.filter(p => !positionsEqual(p, startPos));

  return endPositions.some(p => positionsEqual(p, position));
}

// Get direction from one position to another
export function getDirection(from: Position, to: Position): Direction | null {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;

  if (rowDiff === -1 && colDiff === 0) return 'up';
  if (rowDiff === 1 && colDiff === 0) return 'down';
  if (rowDiff === 0 && colDiff === -1) return 'left';
  if (rowDiff === 0 && colDiff === 1) return 'right';

  return null;
}

// Get the cell position from touch coordinates
export function getCellFromTouch(
  x: number,
  y: number,
  cellSize: number,
  gridOffset: {x: number; y: number},
): Position {
  const col = Math.floor((x - gridOffset.x) / cellSize);
  const row = Math.floor((y - gridOffset.y) / cellSize);
  return {row, col};
}
