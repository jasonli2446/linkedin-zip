import {GameState, GameAction, Cell, Position, Puzzle} from './types';

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
        isOnPath: false,
      };
    }
  }

  // Place checkpoint numbers on grid
  for (const checkpoint of puzzle.checkpoints) {
    const {row, col} = checkpoint.position;
    grid[row][col].value = checkpoint.number;
  }

  return grid;
}

// Create initial game state from puzzle
export function createInitialState(puzzle: Puzzle): GameState {
  return {
    puzzle,
    grid: createGrid(puzzle),
    path: [],
    nextCheckpoint: 1, // Start looking for checkpoint 1
    isDrawing: false,
    isComplete: false,
    moveCount: 0,
    startTime: null,
    endTime: null,
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

// Get checkpoint number at position
function getCheckpointAt(puzzle: Puzzle, position: Position): number | null {
  const checkpoint = puzzle.checkpoints.find(
    c => c.position.row === position.row && c.position.col === position.col,
  );
  return checkpoint ? checkpoint.number : null;
}

// Check if path visits all checkpoints in order and fills all cells
function checkWinCondition(state: GameState): boolean {
  const {puzzle, path, grid} = state;
  const totalCells = puzzle.size * puzzle.size;

  // Path must fill all cells
  if (path.length !== totalCells) return false;

  // Check all checkpoints are visited in order
  let nextExpected = 1;
  for (const pos of path) {
    const checkpointNum = getCheckpointAt(puzzle, pos);
    if (checkpointNum !== null) {
      if (checkpointNum !== nextExpected) return false;
      nextExpected++;
    }
  }

  // All checkpoints must have been visited
  return nextExpected === puzzle.checkpoints.length + 1;
}

// Game state reducer
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_PATH': {
      const {position} = action;
      const {puzzle, path} = state;

      // If we already have a path, check if touching any cell on the path
      if (path.length > 0) {
        const pathIndex = path.findIndex(p => positionsEqual(p, position));

        if (pathIndex !== -1) {
          // Truncate path to this point (remove everything after)
          const newPath = path.slice(0, pathIndex + 1);
          const newGrid = state.grid.map(row =>
            row.map(cell => ({...cell, isOnPath: false})),
          );

          // Mark only cells in new path as on path
          for (const pos of newPath) {
            newGrid[pos.row][pos.col].isOnPath = true;
          }

          // Recalculate nextCheckpoint based on truncated path
          let newNextCheckpoint = 1;
          for (const pos of newPath) {
            const checkpointNum = getCheckpointAt(puzzle, pos);
            if (checkpointNum !== null && checkpointNum >= newNextCheckpoint) {
              newNextCheckpoint = checkpointNum + 1;
            }
          }

          return {
            ...state,
            grid: newGrid,
            path: newPath,
            nextCheckpoint: newNextCheckpoint,
            isDrawing: true,
            isComplete: false,
          };
        }

        // Touched a cell not on the path - ignore
        return state;
      }

      // Starting fresh: can only start from checkpoint 1
      const checkpointNum = getCheckpointAt(puzzle, position);
      if (checkpointNum !== 1) return state;

      // Create new grid with this cell marked
      const newGrid = state.grid.map(row =>
        row.map(cell => ({...cell, isOnPath: false})),
      );
      newGrid[position.row][position.col].isOnPath = true;

      return {
        ...state,
        grid: newGrid,
        path: [position],
        nextCheckpoint: 2, // Now looking for checkpoint 2
        isDrawing: true,
        isComplete: false,
        startTime: Date.now(),
        endTime: null,
      };
    }

    case 'EXTEND_PATH': {
      const {position} = action;
      const {path, grid, puzzle, nextCheckpoint} = state;

      if (!state.isDrawing || path.length === 0) return state;

      const lastCell = path[path.length - 1];

      // Must be adjacent to last cell
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

      // Check if backtracking (going back to previous cell)
      if (path.length >= 2) {
        const secondLast = path[path.length - 2];
        if (positionsEqual(secondLast, position)) {
          // Backtrack: remove last cell from path
          const removedCell = path[path.length - 1];
          const newPath = path.slice(0, -1);
          const newGrid = state.grid.map(row => row.map(cell => ({...cell})));
          newGrid[removedCell.row][removedCell.col].isOnPath = false;

          // Check if we're backtracking from a checkpoint
          const removedCheckpoint = getCheckpointAt(puzzle, removedCell);
          let newNextCheckpoint = nextCheckpoint;
          if (removedCheckpoint !== null && removedCheckpoint === nextCheckpoint - 1) {
            newNextCheckpoint = nextCheckpoint - 1;
          }

          return {
            ...state,
            grid: newGrid,
            path: newPath,
            nextCheckpoint: newNextCheckpoint,
          };
        }
      }

      // Can't visit a cell already on the path (except backtracking handled above)
      const alreadyOnPath = path.some(p => positionsEqual(p, position));
      if (alreadyOnPath) return state;

      // Check if this cell has a checkpoint number
      const checkpointNum = getCheckpointAt(puzzle, position);

      // If cell has a checkpoint, it must be the next one we're looking for
      // (or we can pass through any checkpoint we've already visited)
      if (checkpointNum !== null) {
        if (checkpointNum > nextCheckpoint) {
          // Can't skip ahead
          return state;
        }
        if (checkpointNum < nextCheckpoint - 1) {
          // Can't go back to an old checkpoint (except the one right before current)
          // Actually for this game, once visited, you can't revisit
          return state;
        }
      }

      // Add cell to path
      const newPath = [...path, position];
      const newGrid = state.grid.map(row => row.map(cell => ({...cell})));
      newGrid[position.row][position.col].isOnPath = true;

      // Update next checkpoint if we just reached one
      let newNextCheckpoint = nextCheckpoint;
      if (checkpointNum === nextCheckpoint) {
        newNextCheckpoint = nextCheckpoint + 1;
      }

      const newState = {
        ...state,
        grid: newGrid,
        path: newPath,
        nextCheckpoint: newNextCheckpoint,
        moveCount: state.moveCount + 1,
      };

      // Check for win
      if (checkWinCondition(newState)) {
        return {
          ...newState,
          isComplete: true,
          isDrawing: false,
          endTime: Date.now(),
        };
      }

      return newState;
    }

    case 'END_DRAWING': {
      return {
        ...state,
        isDrawing: false,
      };
    }

    case 'CLEAR_PATH': {
      const newGrid = state.grid.map(row =>
        row.map(cell => ({...cell, isOnPath: false})),
      );

      return {
        ...state,
        grid: newGrid,
        path: [],
        nextCheckpoint: 1,
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

    case 'UNDO': {
      const {path, puzzle} = state;
      if (path.length <= 1) {
        // Can't undo past starting point, just reset
        return createInitialState(puzzle);
      }

      // Remove last cell from path
      const removedCell = path[path.length - 1];
      const newPath = path.slice(0, -1);
      const newGrid = state.grid.map(row => row.map(cell => ({...cell})));
      newGrid[removedCell.row][removedCell.col].isOnPath = false;

      // Check if we're undoing from a checkpoint
      const removedCheckpoint = getCheckpointAt(puzzle, removedCell);
      let newNextCheckpoint = state.nextCheckpoint;
      if (removedCheckpoint !== null && removedCheckpoint === state.nextCheckpoint - 1) {
        newNextCheckpoint = state.nextCheckpoint - 1;
      }

      return {
        ...state,
        grid: newGrid,
        path: newPath,
        nextCheckpoint: newNextCheckpoint,
        isDrawing: false,
      };
    }

    default:
      return state;
  }
}
