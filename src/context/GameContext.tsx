import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {GameState, GameAction, Position, Puzzle} from '../game/types';
import {gameReducer, createInitialState} from '../game/gameState';
import {generatePuzzle} from '../generator/puzzleGenerator';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startPath: (position: Position) => void;
  extendPath: (position: Position) => void;
  endDrawing: () => void;
  clearPath: () => void;
  resetPuzzle: () => void;
  newPuzzle: (size?: number, numCheckpoints?: number) => void;
  undo: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// Default puzzle for initial load
const DEFAULT_PUZZLE = generatePuzzle(5, 6);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({children}: GameProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(
    gameReducer,
    DEFAULT_PUZZLE,
    createInitialState,
  );

  const startPath = useCallback((position: Position) => {
    dispatch({type: 'START_PATH', position});
  }, []);

  const extendPath = useCallback((position: Position) => {
    dispatch({type: 'EXTEND_PATH', position});
  }, []);

  const endDrawing = useCallback(() => {
    dispatch({type: 'END_DRAWING'});
  }, []);

  const clearPath = useCallback(() => {
    dispatch({type: 'CLEAR_PATH'});
  }, []);

  const resetPuzzle = useCallback(() => {
    dispatch({type: 'RESET_PUZZLE'});
  }, []);

  const undo = useCallback(() => {
    dispatch({type: 'UNDO'});
  }, []);

  const newPuzzle = useCallback(
    (size: number = 5, numCheckpoints: number = 6) => {
      const puzzle = generatePuzzle(size, numCheckpoints);
      dispatch({type: 'SET_PUZZLE', puzzle});
    },
    [],
  );

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
      undo,
    }),
    [state, startPath, extendPath, endDrawing, clearPath, resetPuzzle, newPuzzle, undo],
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
