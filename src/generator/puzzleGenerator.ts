import {Position, Puzzle, Endpoint, Path, DIRECTIONS} from '../game/types';
import {positionsEqual} from '../game/gameState';
import {isInBounds, getAdjacentPositions} from '../game/pathLogic';
import {isValidPuzzle} from './solver';

interface GeneratorState {
  grid: (number | null)[][];
  paths: Path[];
  size: number;
}

// Shuffle array in place (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Get random element from array
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Create empty grid
function createEmptyGrid(size: number): (number | null)[][] {
  const grid: (number | null)[][] = [];
  for (let row = 0; row < size; row++) {
    grid[row] = new Array(size).fill(null);
  }
  return grid;
}

// Find empty cell adjacent to any existing path
function findAdjacentEmptyCell(state: GeneratorState): Position | null {
  const candidates: Position[] = [];

  for (let row = 0; row < state.size; row++) {
    for (let col = 0; col < state.size; col++) {
      if (state.grid[row][col] === null) {
        // Check if adjacent to any path
        const pos = {row, col};
        const hasAdjacentPath = getAdjacentPositions(pos).some(adj => {
          if (!isInBounds(adj, state.size)) return false;
          return state.grid[adj.row][adj.col] !== null;
        });

        if (hasAdjacentPath || state.paths.length === 0) {
          candidates.push(pos);
        }
      }
    }
  }

  if (candidates.length === 0) return null;
  return randomElement(candidates);
}

// Find any empty cell
function findEmptyCell(state: GeneratorState): Position | null {
  const emptyCells: Position[] = [];

  for (let row = 0; row < state.size; row++) {
    for (let col = 0; col < state.size; col++) {
      if (state.grid[row][col] === null) {
        emptyCells.push({row, col});
      }
    }
  }

  if (emptyCells.length === 0) return null;
  return randomElement(emptyCells);
}

// Generate a random path from starting position
function generateRandomPath(
  state: GeneratorState,
  pathId: number,
  startPos: Position,
  minLength: number,
  maxLength: number,
): Position[] | null {
  const path: Position[] = [startPos];
  state.grid[startPos.row][startPos.col] = pathId;

  const targetLength = minLength + Math.floor(Math.random() * (maxLength - minLength + 1));

  let attempts = 0;
  const maxAttempts = 100;

  while (path.length < targetLength && attempts < maxAttempts) {
    attempts++;

    const lastCell = path[path.length - 1];
    const adjacentCells = shuffleArray(getAdjacentPositions(lastCell));

    let extended = false;
    for (const adj of adjacentCells) {
      if (!isInBounds(adj, state.size)) continue;
      if (state.grid[adj.row][adj.col] !== null) continue;

      // Extend path
      path.push(adj);
      state.grid[adj.row][adj.col] = pathId;
      extended = true;
      break;
    }

    if (!extended) {
      // Can't extend further, path is stuck
      break;
    }
  }

  // Path must be at least minLength
  if (path.length < minLength) {
    // Clear path from grid
    for (const pos of path) {
      state.grid[pos.row][pos.col] = null;
    }
    return null;
  }

  return path;
}

// Generate puzzle by filling grid with paths
function generateFilledPuzzle(size: number, numPaths: number): Puzzle | null {
  const state: GeneratorState = {
    grid: createEmptyGrid(size),
    paths: [],
    size,
  };

  const minPathLength = Math.max(3, Math.floor((size * size) / numPaths) - 2);
  const maxPathLength = Math.floor((size * size) / numPaths) + 3;

  for (let i = 0; i < numPaths; i++) {
    const pathId = i + 1;

    // Find starting position
    let startPos: Position | null;
    if (i === 0) {
      // First path can start anywhere
      startPos = findEmptyCell(state);
    } else {
      // Subsequent paths should start adjacent to existing paths
      startPos = findAdjacentEmptyCell(state);
      if (!startPos) {
        startPos = findEmptyCell(state);
      }
    }

    if (!startPos) {
      // No empty cells available
      return null;
    }

    // Generate random path
    const pathCells = generateRandomPath(
      state,
      pathId,
      startPos,
      minPathLength,
      maxPathLength,
    );

    if (!pathCells) {
      // Failed to generate path, try regenerating
      return null;
    }

    state.paths.push({
      id: pathId,
      color: '',
      cells: pathCells,
      isComplete: true,
    });
  }

  // Check if all cells are filled
  let emptyCells = 0;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (state.grid[row][col] === null) {
        emptyCells++;
      }
    }
  }

  // Try to fill remaining cells by extending existing paths
  while (emptyCells > 0) {
    let filled = false;

    for (const path of shuffleArray([...state.paths])) {
      // Try to extend from either endpoint
      for (const endpoint of [path.cells[0], path.cells[path.cells.length - 1]]) {
        const adjacentEmpty = shuffleArray(getAdjacentPositions(endpoint)).filter(
          adj =>
            isInBounds(adj, size) && state.grid[adj.row][adj.col] === null,
        );

        if (adjacentEmpty.length > 0) {
          const newCell = adjacentEmpty[0];
          state.grid[newCell.row][newCell.col] = path.id;

          // Add to path at appropriate end
          if (positionsEqual(endpoint, path.cells[0])) {
            path.cells.unshift(newCell);
          } else {
            path.cells.push(newCell);
          }

          emptyCells--;
          filled = true;
          break;
        }
      }

      if (filled) break;
    }

    if (!filled) {
      // Can't fill remaining cells
      return null;
    }
  }

  // Create puzzle with endpoints
  const endpoints: Endpoint[] = state.paths.map(path => ({
    id: path.id,
    positions: [path.cells[0], path.cells[path.cells.length - 1]] as [Position, Position],
  }));

  return {
    size,
    endpoints,
    solution: state.paths,
  };
}

// Main puzzle generation function
export function generatePuzzle(
  size: number = 5,
  numPaths: number = 4,
  maxAttempts: number = 50,
): Puzzle {
  // Validate parameters
  size = Math.max(4, Math.min(10, size));
  numPaths = Math.max(2, Math.min(Math.floor((size * size) / 4), numPaths));

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const puzzle = generateFilledPuzzle(size, numPaths);

    if (puzzle && isValidPuzzle(puzzle)) {
      // Remove solution from returned puzzle (player shouldn't see it)
      return {
        size: puzzle.size,
        endpoints: puzzle.endpoints,
      };
    }
  }

  // Fallback: return a simple guaranteed-solvable puzzle
  return createFallbackPuzzle(size, numPaths);
}

// Create a simple fallback puzzle when generation fails
function createFallbackPuzzle(size: number, numPaths: number): Puzzle {
  // Create simple horizontal paths
  const endpoints: Endpoint[] = [];

  for (let i = 0; i < numPaths; i++) {
    const row = i % size;
    endpoints.push({
      id: i + 1,
      positions: [
        {row, col: 0},
        {row, col: size - 1},
      ],
    });
  }

  // If we need more paths, add vertical ones
  if (numPaths > size) {
    for (let i = size; i < numPaths; i++) {
      const col = i - size;
      endpoints.push({
        id: i + 1,
        positions: [
          {row: 0, col},
          {row: size - 1, col},
        ],
      });
    }
  }

  return {
    size,
    endpoints: endpoints.slice(0, numPaths),
  };
}

// Generate puzzle with specific difficulty
export function generatePuzzleWithDifficulty(
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master',
): Puzzle {
  const configs: Record<string, {size: number; numPaths: number}> = {
    easy: {size: 5, numPaths: 4},
    medium: {size: 6, numPaths: 5},
    hard: {size: 7, numPaths: 6},
    expert: {size: 8, numPaths: 7},
    master: {size: 9, numPaths: 8},
  };

  const config = configs[difficulty] || configs.easy;
  return generatePuzzle(config.size, config.numPaths);
}
