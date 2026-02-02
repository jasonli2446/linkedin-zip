import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Cell as CellType} from '../game/types';
import {COLORS} from '../utils/colors';

interface CellProps {
  cell: CellType;
  size: number;
  isNextCheckpoint?: boolean;
}

export function Cell({
  cell,
  size,
  isNextCheckpoint = false,
}: CellProps): React.JSX.Element {
  const hasCheckpoint = cell.value !== null;

  return (
    <View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
        },
      ]}>
      {hasCheckpoint && (
        <View
          style={[
            styles.checkpointCircle,
            {
              backgroundColor: COLORS.checkpoint,
              borderColor: isNextCheckpoint
                ? COLORS.nextCheckpointBorder
                : 'transparent',
              borderWidth: isNextCheckpoint ? 3 : 0,
            },
          ]}>
          <Text
            style={[
              styles.checkpointText,
              {
                fontSize: size * 0.35,
              },
            ]}>
            {cell.value}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.cellBorder,
    backgroundColor: COLORS.cellBackground,
  },
  checkpointCircle: {
    width: '65%',
    height: '65%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  checkpointText: {
    fontWeight: 'bold',
    color: COLORS.checkpointText,
  },
});
