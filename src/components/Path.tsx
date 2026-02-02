import React from 'react';
import Svg, {Line, Circle} from 'react-native-svg';
import {Position} from '../game/types';

interface PathProps {
  cells: Position[];
  color: string;
  cellSize: number;
  gridSize: number;
  isComplete: boolean;
}

export function PathRenderer({
  cells,
  color,
  cellSize,
  gridSize,
  isComplete,
}: PathProps): React.JSX.Element | null {
  if (cells.length < 2) return null;

  const getCellCenter = (pos: Position): {x: number; y: number} => ({
    x: pos.col * cellSize + cellSize / 2,
    y: pos.row * cellSize + cellSize / 2,
  });

  const strokeWidth = cellSize * 0.3;
  const totalSize = gridSize * cellSize;

  return (
    <Svg
      width={totalSize}
      height={totalSize}
      style={{position: 'absolute', top: 0, left: 0}}>
      {/* Draw lines between cells */}
      {cells.slice(1).map((cell, index) => {
        const from = getCellCenter(cells[index]);
        const to = getCellCenter(cell);

        return (
          <Line
            key={`line-${index}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      })}

      {/* Draw circles at each cell for smoother path */}
      {cells.map((cell, index) => {
        const center = getCellCenter(cell);
        return (
          <Circle
            key={`circle-${index}`}
            cx={center.x}
            cy={center.y}
            r={strokeWidth / 2}
            fill={color}
          />
        );
      })}
    </Svg>
  );
}
