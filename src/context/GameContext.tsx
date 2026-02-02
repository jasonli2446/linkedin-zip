import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  GameState,
  GameAction,
  Position,
  Puzzle,
} from '../game/types';
import {gameReducer, createInitialState} from '../game/gameState';
import {checkWinCondition} from '../game/winChecker';
import {generatePuzzle} from '../generator/puzzleGenerator';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startPath: (pathId: number, position: Position) => void;
  extendPath: (position: Position) => void;
  endDrawing: () => void;
  clearPath: (pathId: number) => void;
  resetPuzzle: () => void;
  newPuzzle: (size?: number, numPaths?: number) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// Default puzzle for initial load
const DEFAULT_PUZZLE: Puzzle = {
  size: 5,
  endpoints: [
    {id: 1, positions: [{row: 0, col: 0}, {row: 4, col: 4}]},
    {id: 2, positions: [{row: 0, col: 4}, {row: 4, col: 0}]},
    {id: 3, positions: [{row: 2, col: 0}, {row: 2, col: 4}]},
    {id: 4, positions: [{row: 0, col: 2}, {row: 4, col: 2}]},
  ],
};

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({children}: GameProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(
    gameReducer,
    DEFAULT_PUZZLE,
    createInitialState,
  );

  const startPath = useCallback((pathId: number, position: Position) => {
    dispatch({type: 'START_PATH', pathId, position});
  }, []);

  const extendPath = useCallback((position: Position) => {
    dispatch({type: 'EXTEND_PATH', position});
  }, []);

  const endDrawing = useCallback(() => {
    dispatch({type: 'END_DRAWING'});
  }, []);

  const clearPath = useCallback((pathId: number) => {
    dispatch({type: 'CLEAR_PATH', pathId});
  }, []);

  const resetPuzzle = useCallback(() => {
    dispatch({type: 'RESET_PUZZLE'});
  }, []);

  const newPuzzle = useCallback((size: number = 5, numPaths: number = 4) => {
    const puzzle = generatePuzzle(size, numPaths);
    dispatch({type: 'SET_PUZZLE', puzzle});
  }, []);

  // Check for win condition after each state change
  React.useEffect(() => {
    if (!state.isComplete && checkWinCondition(state)) {
      dispatch({type: 'SET_COMPLETE'});
    }
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      startPath,
      extendPath,
      endDrawing,
      clearPath,
      resetPuzzle,
      newPuzzle,
    }),
    [state, startPath, extendPath, endDrawing, clearPath, resetPuzzle, newPuzzle],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
