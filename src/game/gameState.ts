import {
  GameState,
  GameAction,
  Cell,
  Path,
  Position,
  Puzzle,
} from './types';
import {getPathColor} from '../utils/colors';

// Create initial grid from puzzle
export function createGrid(puzzle: Puzzle): Cell[][] {
  const grid: Cell[][] = [];

  for (let row = 0; row < puzzle.size; row++) {
    grid[row] = [];
    for (let col = 0; col < puzzle.size; col++) {
      grid[row][col] = {
        row,
        col,
        value: null,
        pathId: null,
      };
    }
  }

  // Place endpoints on grid
  for (const endpoint of puzzle.endpoints) {
    for (const pos of endpoint.positions) {
      grid[pos.row][pos.col].value = endpoint.id;
    }
  }

  return grid;
}

// Create initial paths from puzzle endpoints
export function createPaths(puzzle: Puzzle): Map<number, Path> {
  const paths = new Map<number, Path>();

  for (const endpoint of puzzle.endpoints) {
    paths.set(endpoint.id, {
      id: endpoint.id,
      color: getPathColor(endpoint.id),
      cells: [],
      isComplete: false,
    });
  }

  return paths;
}

// Create initial game state from puzzle
export function createInitialState(puzzle: Puzzle): GameState {
  return {
    puzzle,
    grid: createGrid(puzzle),
    paths: createPaths(puzzle),
    currentPathId: null,
    isDrawing: false,
    isComplete: false,
    moveCount: 0,
  };
}

// Check if two positions are equal
export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

// Check if two positions are adjacent
export function areAdjacent(a: Position, b: Position): boolean {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// Find which endpoint a position belongs to
function findEndpointAtPosition(
  puzzle: Puzzle,
  position: Position,
): number | null {
  for (const endpoint of puzzle.endpoints) {
    for (const pos of endpoint.positions) {
      if (positionsEqual(pos, position)) {
        return endpoint.id;
      }
    }
  }
  return null;
}

// Get the other endpoint position for a path
function getOtherEndpoint(puzzle: Puzzle, pathId: number): Position | null {
  const endpoint = puzzle.endpoints.find(e => e.id === pathId);
  if (!endpoint) return null;
  return endpoint.positions[1];
}

// Game state reducer
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_PATH': {
      const {pathId, position} = action;
      const path = state.paths.get(pathId);

      if (!path) return state;

      // Clear existing path cells from grid
      const newGrid = state.grid.map(row =>
        row.map(cell => {
          if (cell.pathId === pathId && cell.value !== pathId) {
            return {...cell, pathId: null};
          }
          return cell;
        }),
      );

      // Mark starting position
      newGrid[position.row][position.col] = {
        ...newGrid[position.row][position.col],
        pathId,
      };

      const newPaths = new Map(state.paths);
      newPaths.set(pathId, {
        ...path,
        cells: [position],
        isComplete: false,
      });

      return {
        ...state,
        grid: newGrid,
        paths: newPaths,
        currentPathId: pathId,
        isDrawing: true,
      };
    }

    case 'EXTEND_PATH': {
      const {position} = action;
      const {currentPathId, grid, paths, puzzle} = state;

      if (!currentPathId || !state.isDrawing) return state;

      const path = paths.get(currentPathId);
      if (!path || path.cells.length === 0) return state;

      const lastCell = path.cells[path.cells.length - 1];

      // Check if adjacent to last cell
      if (!areAdjacent(lastCell, position)) return state;

      // Check bounds
      if (
        position.row < 0 ||
        position.row >= puzzle.size ||
        position.col < 0 ||
        position.col >= puzzle.size
      ) {
        return state;
      }

      const targetCell = grid[position.row][position.col];

      // Check if backtracking (going back to previous cell)
      if (path.cells.length >= 2) {
        const secondLast = path.cells[path.cells.length - 2];
        if (positionsEqual(secondLast, position)) {
          // Backtrack: remove last cell from path
          const newCells = path.cells.slice(0, -1);
          const newGrid = state.grid.map(row => row.map(cell => ({...cell})));

          // Clear the removed cell (unless it's an endpoint)
          if (grid[lastCell.row][lastCell.col].value !== currentPathId) {
            newGrid[lastCell.row][lastCell.col].pathId = null;
          }

          const newPaths = new Map(paths);
          newPaths.set(currentPathId, {
            ...path,
            cells: newCells,
            isComplete: false,
          });

          return {
            ...state,
            grid: newGrid,
            paths: newPaths,
          };
        }
      }

      // Check if cell is already occupied by another path
      if (targetCell.pathId !== null && targetCell.pathId !== currentPathId) {
        return state;
      }

      // Check if cell is already in current path (no loops except backtracking)
      const alreadyInPath = path.cells.some(c => positionsEqual(c, position));
      if (alreadyInPath) return state;

      // Check if this is the matching endpoint
      const isMatchingEndpoint =
        targetCell.value === currentPathId &&
        !positionsEqual(path.cells[0], position);

      // If target has a value (endpoint), must be matching endpoint
      if (
        targetCell.value !== null &&
        targetCell.value !== currentPathId
      ) {
        return state;
      }

      // Add cell to path
      const newCells = [...path.cells, position];
      const newGrid = state.grid.map(row => row.map(cell => ({...cell})));
      newGrid[position.row][position.col].pathId = currentPathId;

      const newPaths = new Map(paths);
      newPaths.set(currentPathId, {
        ...path,
        cells: newCells,
        isComplete: isMatchingEndpoint,
      });

      return {
        ...state,
        grid: newGrid,
        paths: newPaths,
        moveCount: state.moveCount + 1,
      };
    }

    case 'END_DRAWING': {
      return {
        ...state,
        isDrawing: false,
        currentPathId: null,
      };
    }

    case 'CLEAR_PATH': {
      const {pathId} = action;
      const path = state.paths.get(pathId);

      if (!path) return state;

      // Clear path cells from grid (except endpoints)
      const newGrid = state.grid.map(row =>
        row.map(cell => {
          if (cell.pathId === pathId && cell.value !== pathId) {
            return {...cell, pathId: null};
          }
          return cell;
        }),
      );

      const newPaths = new Map(state.paths);
      newPaths.set(pathId, {
        ...path,
        cells: [],
        isComplete: false,
      });

      return {
        ...state,
        grid: newGrid,
        paths: newPaths,
        currentPathId: null,
        isDrawing: false,
      };
    }

    case 'RESET_PUZZLE': {
      return createInitialState(state.puzzle);
    }

    case 'SET_PUZZLE': {
      return createInitialState(action.puzzle);
    }

    case 'SET_COMPLETE': {
      return {
        ...state,
        isComplete: true,
      };
    }

    default:
      return state;
  }
}
