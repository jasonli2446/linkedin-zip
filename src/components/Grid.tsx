import React, {useCallback, useRef} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import {Cell} from './Cell';
import {PathRenderer} from './Path';
import {useGame} from '../context/GameContext';
import {Position} from '../game/types';
import {COLORS} from '../utils/colors';
import {positionsEqual} from '../game/gameState';

const GRID_PADDING = 20;
const MAX_GRID_WIDTH = 400;

// Check if position is within grid bounds
function isInBounds(pos: Position, size: number): boolean {
  return pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size;
}

export function Grid(): React.JSX.Element {
  const {state, startPath, extendPath, endDrawing} = useGame();
  const {puzzle, grid, path} = state;
  const lastCellRef = useRef<Position | null>(null);

  // Calculate cell size based on screen width
  const screenWidth = Dimensions.get('window').width;
  const availableWidth = Math.min(screenWidth - GRID_PADDING * 2, MAX_GRID_WIDTH);
  const cellSize = Math.floor(availableWidth / puzzle.size);
  const gridWidth = cellSize * puzzle.size;

  // Get cell position from touch coordinates
  const getCellFromCoords = useCallback(
    (x: number, y: number): Position | null => {
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      if (!isInBounds({row, col}, puzzle.size)) {
        return null;
      }

      return {row, col};
    },
    [cellSize, puzzle.size],
  );

  // Handlers wrapped for worklet safety
  const handleBegin = useCallback(
    (x: number, y: number) => {
      const cell = getCellFromCoords(x, y);
      if (!cell) return;

      lastCellRef.current = cell;

      // Check if this is checkpoint 1 (starting point) or any cell on existing path
      const cellData = grid[cell.row][cell.col];
      if (cellData.value === 1 && path.length === 0) {
        // Starting fresh from checkpoint 1
        startPath(cell);
      } else if (path.length > 0) {
        // Check if touching any cell on the path - will truncate to that point
        const onPath = path.some(p => p.row === cell.row && p.col === cell.col);
        if (onPath) {
          startPath(cell);
        }
      }
    },
    [getCellFromCoords, grid, startPath, path],
  );

  const handleUpdate = useCallback(
    (x: number, y: number) => {
      if (!state.isDrawing) return;

      const cell = getCellFromCoords(x, y);
      if (!cell) return;

      // Only process if cell changed
      if (lastCellRef.current && positionsEqual(lastCellRef.current, cell)) {
        return;
      }

      lastCellRef.current = cell;
      extendPath(cell);
    },
    [state.isDrawing, getCellFromCoords, extendPath],
  );

  const handleEnd = useCallback(() => {
    lastCellRef.current = null;
    endDrawing();
  }, [endDrawing]);

  // Pan gesture for drawing paths
  const panGesture = Gesture.Pan()
    .onBegin(event => {
      'worklet';
      runOnJS(handleBegin)(event.x, event.y);
    })
    .onUpdate(event => {
      'worklet';
      runOnJS(handleUpdate)(event.x, event.y);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(handleEnd)();
    })
    .onFinalize(() => {
      'worklet';
      runOnJS(handleEnd)();
    });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View
          style={[
            styles.grid,
            {
              width: gridWidth,
              height: gridWidth,
            },
          ]}>
          {/* Render cells */}
          {grid.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((cell, colIndex) => (
                <Cell
                  key={`cell-${rowIndex}-${colIndex}`}
                  cell={cell}
                  size={cellSize}
                  isNextCheckpoint={
                    cell.value === state.nextCheckpoint
                  }
                />
              ))}
            </View>
          ))}

          {/* Render path */}
          {path.length >= 1 && (
            <PathRenderer
              cells={path}
              cellSize={cellSize}
              gridSize={puzzle.size}
              isComplete={state.isComplete}
            />
          )}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    backgroundColor: COLORS.gridBackground,
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});
