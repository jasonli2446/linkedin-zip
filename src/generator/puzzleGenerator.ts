import {Position, Puzzle, Checkpoint, DIRECTIONS} from '../game/types';

// Shuffle array in place (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Check if position is within grid bounds
function isInBounds(pos: Position, size: number): boolean {
  return pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size;
}

// Get adjacent positions
function getAdjacentPositions(pos: Position): Position[] {
  return [
    {row: pos.row - 1, col: pos.col},
    {row: pos.row + 1, col: pos.col},
    {row: pos.row, col: pos.col - 1},
    {row: pos.row, col: pos.col + 1},
  ];
}

// Check if two positions are equal
function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

// Generate a Hamiltonian path (visits every cell exactly once)
function generateHamiltonianPath(size: number): Position[] | null {
  const totalCells = size * size;
  const visited: boolean[][] = Array.from({length: size}, () =>
    Array(size).fill(false),
  );

  // Try starting from different corners/edges for variety
  const startPositions = shuffleArray([
    {row: 0, col: 0},
    {row: 0, col: size - 1},
    {row: size - 1, col: 0},
    {row: size - 1, col: size - 1},
    {row: Math.floor(size / 2), col: 0},
    {row: 0, col: Math.floor(size / 2)},
  ]);

  for (const startPos of startPositions) {
    const path: Position[] = [];

    // Reset visited
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        visited[r][c] = false;
      }
    }

    if (findHamiltonianPath(startPos, visited, path, size, totalCells)) {
      return path;
    }
  }

  return null;
}

// Recursive backtracking to find Hamiltonian path
function findHamiltonianPath(
  pos: Position,
  visited: boolean[][],
  path: Position[],
  size: number,
  totalCells: number,
): boolean {
  path.push(pos);
  visited[pos.row][pos.col] = true;

  if (path.length === totalCells) {
    return true;
  }

  // Get neighbors in random order for variety
  const neighbors = shuffleArray(getAdjacentPositions(pos)).filter(
    adj => isInBounds(adj, size) && !visited[adj.row][adj.col],
  );

  // Use Warnsdorff's rule: prefer cells with fewer unvisited neighbors
  neighbors.sort((a, b) => {
    const aCount = getAdjacentPositions(a).filter(
      n => isInBounds(n, size) && !visited[n.row][n.col],
    ).length;
    const bCount = getAdjacentPositions(b).filter(
      n => isInBounds(n, size) && !visited[n.row][n.col],
    ).length;
    return aCount - bCount;
  });

  for (const neighbor of neighbors) {
    if (findHamiltonianPath(neighbor, visited, path, size, totalCells)) {
      return true;
    }
  }

  // Backtrack
  path.pop();
  visited[pos.row][pos.col] = false;
  return false;
}

// Place checkpoints along the path at good intervals
function placeCheckpoints(
  path: Position[],
  numCheckpoints: number,
): Checkpoint[] {
  const checkpoints: Checkpoint[] = [];
  const pathLength = path.length;

  // First checkpoint is always at start (position 0)
  checkpoints.push({
    number: 1,
    position: {...path[0]},
  });

  // Last checkpoint is always at end
  const lastCheckpointNum = numCheckpoints;

  // Distribute remaining checkpoints evenly along the path
  if (numCheckpoints > 2) {
    const innerCheckpoints = numCheckpoints - 2;
    const spacing = pathLength / (innerCheckpoints + 1);

    for (let i = 1; i <= innerCheckpoints; i++) {
      const pathIndex = Math.round(spacing * i);
      const clampedIndex = Math.min(pathIndex, pathLength - 2);

      checkpoints.push({
        number: i + 1,
        position: {...path[clampedIndex]},
      });
    }
  }

  // Add final checkpoint at end
  checkpoints.push({
    number: lastCheckpointNum,
    position: {...path[pathLength - 1]},
  });

  return checkpoints;
}

// Main puzzle generation function
export function generatePuzzle(
  size: number = 5,
  numCheckpoints: number = 6,
): Puzzle {
  // Validate parameters
  size = Math.max(4, Math.min(10, size));
  numCheckpoints = Math.max(2, Math.min(size * size, numCheckpoints));

  // Try to generate a Hamiltonian path
  let path = generateHamiltonianPath(size);

  // Fallback to a simpler snake pattern if Hamiltonian fails
  if (!path) {
    path = generateSnakePath(size);
  }

  // Place checkpoints along the path
  const checkpoints = placeCheckpoints(path, numCheckpoints);

  return {
    size,
    checkpoints,
    solution: path,
  };
}

// Generate a simple snake path (guaranteed to work)
function generateSnakePath(size: number): Position[] {
  const path: Position[] = [];

  for (let row = 0; row < size; row++) {
    if (row % 2 === 0) {
      // Left to right
      for (let col = 0; col < size; col++) {
        path.push({row, col});
      }
    } else {
      // Right to left
      for (let col = size - 1; col >= 0; col--) {
        path.push({row, col});
      }
    }
  }

  return path;
}

// Generate puzzle with specific difficulty
export function generatePuzzleWithDifficulty(
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master',
): Puzzle {
  const configs: Record<string, {size: number; numCheckpoints: number}> = {
    easy: {size: 5, numCheckpoints: 6},
    medium: {size: 6, numCheckpoints: 8},
    hard: {size: 7, numCheckpoints: 10},
    expert: {size: 8, numCheckpoints: 12},
    master: {size: 9, numCheckpoints: 14},
  };

  const config = configs[difficulty] || configs.easy;
  return generatePuzzle(config.size, config.numCheckpoints);
}
