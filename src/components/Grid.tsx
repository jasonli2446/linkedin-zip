import React, {useCallback, useRef} from 'react';
import {View, StyleSheet, Dimensions, LayoutChangeEvent} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {Cell} from './Cell';
import {PathRenderer} from './Path';
import {useGame} from '../context/GameContext';
import {Position} from '../game/types';
import {COLORS, getPathColor} from '../utils/colors';
import {positionsEqual} from '../game/gameState';
import {isInBounds} from '../game/pathLogic';

const GRID_PADDING = 20;
const MAX_GRID_WIDTH = 400;

export function Grid(): React.JSX.Element {
  const {state, startPath, extendPath, endDrawing} = useGame();
  const {puzzle, grid, paths} = state;
  const gridRef = useRef<View>(null);
  const gridLayoutRef = useRef<{x: number; y: number; width: number}>({
    x: 0,
    y: 0,
    width: 0,
  });

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

  // Find endpoint at position
  const findEndpointAt = useCallback(
    (position: Position): number | null => {
      const cell = grid[position.row][position.col];
      return cell.value;
    },
    [grid],
  );

  // Track the last processed cell to avoid duplicate events
  const lastCellRef = useRef<Position | null>(null);

  // Pan gesture for drawing paths
  const panGesture = Gesture.Pan()
    .onBegin(event => {
      const cell = getCellFromCoords(event.x, event.y);
      if (!cell) return;

      lastCellRef.current = cell;
      const endpointId = findEndpointAt(cell);

      if (endpointId !== null) {
        startPath(endpointId, cell);
      }
    })
    .onUpdate(event => {
      if (!state.isDrawing) return;

      const cell = getCellFromCoords(event.x, event.y);
      if (!cell) return;

      // Only process if cell changed
      if (
        lastCellRef.current &&
        positionsEqual(lastCellRef.current, cell)
      ) {
        return;
      }

      lastCellRef.current = cell;
      extendPath(cell);
    })
    .onEnd(() => {
      lastCellRef.current = null;
      endDrawing();
    })
    .onFinalize(() => {
      lastCellRef.current = null;
      endDrawing();
    });

  // Get path color for a cell
  const getPathColorForCell = useCallback(
    (cell: {pathId: number | null}): string | null => {
      if (cell.pathId === null) return null;
      const path = paths.get(cell.pathId);
      return path?.color || null;
    },
    [paths],
  );

  // Check if a cell is an endpoint
  const isEndpoint = useCallback(
    (row: number, col: number): boolean => {
      return grid[row][col].value !== null;
    },
    [grid],
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View
          ref={gridRef}
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
                  pathColor={getPathColorForCell(cell)}
                  size={cellSize}
                  isEndpoint={isEndpoint(rowIndex, colIndex)}
                />
              ))}
            </View>
          ))}

          {/* Render paths */}
          {Array.from(paths.values()).map(
            path =>
              path.cells.length >= 2 && (
                <PathRenderer
                  key={`path-${path.id}`}
                  cells={path.cells}
                  color={path.color}
                  cellSize={cellSize}
                  gridSize={puzzle.size}
                  isComplete={path.isComplete}
                />
              ),
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
