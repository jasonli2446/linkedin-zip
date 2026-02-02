import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Cell as CellType} from '../game/types';
import {COLORS} from '../utils/colors';

interface CellProps {
  cell: CellType;
  pathColor: string | null;
  size: number;
  isEndpoint: boolean;
}

export function Cell({
  cell,
  pathColor,
  size,
  isEndpoint,
}: CellProps): React.JSX.Element {
  const backgroundColor = pathColor || COLORS.cellBackground;
  const showNumber = cell.value !== null;

  return (
    <View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor,
        },
      ]}>
      {showNumber && (
        <View
          style={[
            styles.endpointCircle,
            {
              backgroundColor: pathColor || COLORS.cellHighlight,
              borderColor: pathColor ? 'rgba(255,255,255,0.5)' : 'transparent',
            },
          ]}>
          <Text
            style={[
              styles.endpointText,
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
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
  },
  endpointCircle: {
    width: '70%',
    height: '70%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  endpointText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
