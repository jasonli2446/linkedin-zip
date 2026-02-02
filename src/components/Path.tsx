import React from 'react';
import Svg, {Path as SvgPath, Defs, LinearGradient, Stop} from 'react-native-svg';
import {Position} from '../game/types';

interface PathProps {
  cells: Position[];
  cellSize: number;
  gridSize: number;
  isComplete: boolean;
}

export function PathRenderer({
  cells,
  cellSize,
  gridSize,
  isComplete,
}: PathProps): React.JSX.Element | null {
  if (cells.length === 0) return null;

  const getCellCenter = (pos: Position): {x: number; y: number} => ({
    x: pos.col * cellSize + cellSize / 2,
    y: pos.row * cellSize + cellSize / 2,
  });

  // Path stroke width - slightly smaller than cell for a nice look
  const strokeWidth = cellSize * 0.65;
  const totalSize = gridSize * cellSize;

  // Build SVG path string with rounded corners
  const buildPathString = (): string => {
    if (cells.length === 0) return '';
    if (cells.length === 1) {
      const center = getCellCenter(cells[0]);
      // Draw a small circle for single cell
      return `M ${center.x} ${center.y}`;
    }

    const points = cells.map(getCellCenter);
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }

    return d;
  };

  const pathString = buildPathString();

  return (
    <Svg
      width={totalSize}
      height={totalSize}
      style={{position: 'absolute', top: 0, left: 0}}>
      <Defs>
        <LinearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8B5CF6" />
          <Stop offset="50%" stopColor="#6366F1" />
          <Stop offset="100%" stopColor="#3B82F6" />
        </LinearGradient>
      </Defs>

      {/* Main path */}
      <SvgPath
        d={pathString}
        stroke="url(#pathGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
