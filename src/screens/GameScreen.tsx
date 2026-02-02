import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import {Grid} from '../components/Grid';
import {GameHeader} from '../components/GameHeader';
import {useGame} from '../context/GameContext';
import {COLORS} from '../utils/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

interface GameScreenProps {
  onBack?: () => void;
}

// Format time as MM:SS.d
function formatTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}

export function GameScreen({onBack}: GameScreenProps): React.JSX.Element {
  const {state, newPuzzle, undo, resetPuzzle} = useGame();
  const {isComplete, startTime, endTime} = state;
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update timer every second while playing
  useEffect(() => {
    if (!startTime) {
      setElapsedTime(0);
      return;
    }

    if (isComplete && endTime) {
      setElapsedTime(endTime - startTime);
      return;
    }

    // Update immediately
    setElapsedTime(Date.now() - startTime);

    // Then update every 100ms for smooth decimal display
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, isComplete, endTime]);

  // Animation values for win celebration
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isComplete) {
      // Trigger win animation
      opacity.value = withSpring(1);
      scale.value = withSequence(
        withSpring(1.2),
        withDelay(200, withSpring(1)),
      );
    } else {
      opacity.value = 0;
      scale.value = 1;
    }
  }, [isComplete, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  const handlePlayAgain = () => {
    // Reset the same puzzle
    resetPuzzle();
  };

  const handleNextLevel = () => {
    // New puzzle with same difficulty (same size and checkpoint count)
    newPuzzle(state.puzzle.size, state.puzzle.checkpoints.length);
  };

  const handleUndo = () => {
    undo();
  };

  return (
    <View style={styles.container}>
      <GameHeader onNewPuzzle={handleNextLevel} onBack={onBack} />

      {/* Timer display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
      </View>

      <View style={styles.gridContainer}>
        <Grid />
      </View>

      {/* Bottom Undo button */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleUndo}
          disabled={state.path.length === 0}>
          <Text
            style={[
              styles.bottomButtonText,
              state.path.length === 0 && styles.disabledText,
            ]}>
            Undo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Win Modal */}
      <Modal visible={isComplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, animatedStyle]}>
            <Text style={styles.winTitle}>Puzzle Complete!</Text>
            <Text style={styles.winTime}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.winSubtitle}>
              Great job!
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.playAgainButton]}
                onPress={handlePlayAgain}>
                <Text style={styles.modalButtonText}>Play Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.nextLevelButton]}
                onPress={handleNextLevel}>
                <Text style={styles.modalButtonText}>Next Level</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: 50,
  },
  timerContainer: {
    paddingVertical: 8,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtons: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bottomButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bottomButtonText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.gridBackground,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  winTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 8,
  },
  winTime: {
    fontSize: 48,
    fontWeight: '300',
    color: COLORS.text,
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  winSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  playAgainButton: {
    backgroundColor: COLORS.buttonSecondary,
  },
  nextLevelButton: {
    backgroundColor: COLORS.buttonPrimary,
  },
  modalButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
