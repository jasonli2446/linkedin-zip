import {Position, Puzzle, Path, DIRECTIONS} from '../game/types';
import {positionsEqual} from '../game/gameState';
import {isInBounds, getAdjacentPositions} from '../game/pathLogic';

interface SolverState {
  grid: (number | null)[][]; // pathId or null
  paths: Map<number, Position[]>;
  remainingEndpoints: Map<number, Position>; // pathId -> end position still needed
}

// Deep clone solver state
function cloneState(state: SolverState): SolverState {
  return {
    grid: state.grid.map(row => [...row]),
    paths: new Map(
      Array.from(state.paths.entries()).map(([id, cells]) => [id, [...cells]]),
    ),
    remainingEndpoints: new Map(state.remainingEndpoints),
  };
}

// Create initial solver state from puzzle
function createSolverState(puzzle: Puzzle): SolverState {
  const grid: (number | null)[][] = [];
  for (let row = 0; row < puzzle.size; row++) {
    grid[row] = new Array(puzzle.size).fill(null);
  }

  const paths = new Map<number, Position[]>();
  const remainingEndpoints = new Map<number, Position>();

  // First, mark all endpoints on the grid
  for (const endpoint of puzzle.endpoints) {
    const startPos = endpoint.positions[0];
    const endPos = endpoint.positions[1];
    // Mark both endpoints - they can only be used by their own path
    grid[startPos.row][startPos.col] = endpoint.id;
    grid[endPos.row][endPos.col] = endpoint.id;
  }

  // Then set up paths starting from first endpoint
  for (const endpoint of puzzle.endpoints) {
    const startPos = endpoint.positions[0];
    const endPos = endpoint.positions[1];
    paths.set(endpoint.id, [startPos]);
    remainingEndpoints.set(endpoint.id, endPos);
  }

  return {grid, paths, remainingEndpoints};
}

// Check if position is valid for extension
function canExtendTo(
  state: SolverState,
  pathId: number,
  position: Position,
  size: number,
): boolean {
  if (!isInBounds(position, size)) return false;

  const cellValue = state.grid[position.row][position.col];

  // Cell must be empty or be this path's endpoint
  if (cellValue !== null && cellValue !== pathId) return false;

  return true;
}

// Solve puzzle using backtracking DFS
export function solvePuzzle(puzzle: Puzzle): Path[] | null {
  const initialState = createSolverState(puzzle);

  // Try to solve recursively
  const solution = solveRecursive(initialState, puzzle);

  if (!solution) return null;

  // Convert solution to Path array
  const paths: Path[] = [];
  for (const endpoint of puzzle.endpoints) {
    const cells = solution.paths.get(endpoint.id) || [];
    paths.push({
      id: endpoint.id,
      color: '', // Color will be assigned later
      cells,
      isComplete: true,
    });
  }

  return paths;
}

// Recursive solver with backtracking
function solveRecursive(state: SolverState, puzzle: Puzzle): SolverState | null {
  // Check if all paths are complete
  if (state.remainingEndpoints.size === 0) {
    // Check if all cells are filled
    for (let row = 0; row < puzzle.size; row++) {
      for (let col = 0; col < puzzle.size; col++) {
        if (state.grid[row][col] === null) {
          return null; // Not all cells filled
        }
      }
    }
    return state; // Solution found!
  }

  // Find the path with fewest extension options (most constrained)
  let bestPathId: number | null = null;
  let bestOptions: Position[] = [];
  let minOptions = Infinity;

  for (const [pathId, endPos] of state.remainingEndpoints) {
    const pathCells = state.paths.get(pathId)!;
    const lastCell = pathCells[pathCells.length - 1];

    // Get valid extension options
    const options: Position[] = [];
    for (const adjacent of getAdjacentPositions(lastCell)) {
      if (canExtendTo(state, pathId, adjacent, puzzle.size)) {
        // Check if this cell isn't already in the path
        if (!pathCells.some(c => positionsEqual(c, adjacent))) {
          options.push(adjacent);
        }
      }
    }

    if (options.length === 0) {
      // This path is stuck - no valid moves
      // But first check if we can complete the path
      if (!positionsEqual(lastCell, endPos) && !options.some(o => positionsEqual(o, endPos))) {
        return null; // Dead end
      }
    }

    if (options.length < minOptions) {
      minOptions = options.length;
      bestPathId = pathId;
      bestOptions = options;
    }
  }

  if (bestPathId === null || bestOptions.length === 0) {
    return null;
  }

  const endPos = state.remainingEndpoints.get(bestPathId)!;

  // Prioritize moving toward endpoint
  bestOptions.sort((a, b) => {
    const distA = Math.abs(a.row - endPos.row) + Math.abs(a.col - endPos.col);
    const distB = Math.abs(b.row - endPos.row) + Math.abs(b.col - endPos.col);
    return distA - distB;
  });

  // Try each option
  for (const nextPos of bestOptions) {
    const newState = cloneState(state);
    const pathCells = newState.paths.get(bestPathId)!;

    // Extend path
    pathCells.push(nextPos);
    newState.grid[nextPos.row][nextPos.col] = bestPathId;

    // Check if path is complete
    if (positionsEqual(nextPos, endPos)) {
      newState.remainingEndpoints.delete(bestPathId);
    }

    // Recurse
    const result = solveRecursive(newState, puzzle);
    if (result) {
      return result;
    }
  }

  return null; // No solution found
}

// Check if puzzle has a valid solution
export function isValidPuzzle(puzzle: Puzzle): boolean {
  return solvePuzzle(puzzle) !== null;
}

// Count number of solutions (returns 0, 1, or 2+ represented as 2)
export function countSolutions(puzzle: Puzzle, maxCount: number = 2): number {
  let count = 0;

  function countRecursive(state: SolverState): void {
    if (count >= maxCount) return;

    // Check if all paths are complete
    if (state.remainingEndpoints.size === 0) {
      // Check if all cells are filled
      for (let row = 0; row < puzzle.size; row++) {
        for (let col = 0; col < puzzle.size; col++) {
          if (state.grid[row][col] === null) {
            return;
          }
        }
      }
      count++;
      return;
    }

    // Find path with fewest options
    let bestPathId: number | null = null;
    let bestOptions: Position[] = [];
    let minOptions = Infinity;

    for (const [pathId, endPos] of state.remainingEndpoints) {
      const pathCells = state.paths.get(pathId)!;
      const lastCell = pathCells[pathCells.length - 1];

      const options: Position[] = [];
      for (const adjacent of getAdjacentPositions(lastCell)) {
        if (canExtendTo(state, pathId, adjacent, puzzle.size)) {
          if (!pathCells.some(c => positionsEqual(c, adjacent))) {
            options.push(adjacent);
          }
        }
      }

      if (options.length === 0) {
        return;
      }

      if (options.length < minOptions) {
        minOptions = options.length;
        bestPathId = pathId;
        bestOptions = options;
      }
    }

    if (bestPathId === null) return;

    const endPos = state.remainingEndpoints.get(bestPathId)!;

    for (const nextPos of bestOptions) {
      if (count >= maxCount) return;

      const newState = cloneState(state);
      const pathCells = newState.paths.get(bestPathId!)!;

      pathCells.push(nextPos);
      newState.grid[nextPos.row][nextPos.col] = bestPathId!;

      if (positionsEqual(nextPos, endPos)) {
        newState.remainingEndpoints.delete(bestPathId!);
      }

      countRecursive(newState);
    }
  }

  countRecursive(createSolverState(puzzle));
  return count;
}
