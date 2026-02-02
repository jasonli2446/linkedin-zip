import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useGame} from '../context/GameContext';
import {getCompletionStats} from '../game/winChecker';
import {COLORS} from '../utils/colors';
import {DIFFICULTIES} from '../game/types';

interface GameHeaderProps {
  onNewPuzzle?: () => void;
  onBack?: () => void;
}

export function GameHeader({onNewPuzzle, onBack}: GameHeaderProps): React.JSX.Element {
  const {state, resetPuzzle, newPuzzle} = useGame();
  const stats = getCompletionStats(state);

  const currentDifficulty = DIFFICULTIES.find(
    d => d.gridSize === state.puzzle.size,
  );
  const difficultyName = currentDifficulty?.name || 'Custom';

  const handleNewPuzzle = () => {
    if (onNewPuzzle) {
      onNewPuzzle();
    } else {
      newPuzzle(state.puzzle.size, state.puzzle.checkpoints.length);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button row */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>{"< Back"}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.topRow}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>{difficultyName}</Text>
          <Text style={styles.sizeText}>
            {state.puzzle.size}x{state.puzzle.size}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {stats.checkpointsVisited}/{stats.totalCheckpoints}
            </Text>
            <Text style={styles.statLabel}>Checkpoints</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {stats.cellsFilled}/{stats.totalCells}
            </Text>
            <Text style={styles.statLabel}>Cells</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {width: `${stats.percentComplete}%`},
            ]}
          />
        </View>
        <Text style={styles.progressText}>{stats.percentComplete}%</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetPuzzle}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.newButton]}
          onPress={handleNewPuzzle}>
          <Text style={styles.buttonText}>New Puzzle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
    maxWidth: 400,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: COLORS.buttonPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelInfo: {
    flexDirection: 'column',
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sizeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.cellBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    width: 40,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: COLORS.buttonSecondary,
  },
  newButton: {
    backgroundColor: COLORS.buttonPrimary,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
