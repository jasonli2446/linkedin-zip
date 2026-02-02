import React, {useEffect} from 'react';
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

export function GameScreen(): React.JSX.Element {
  const {state, newPuzzle} = useGame();
  const {isComplete} = state;

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

  const handleNewPuzzle = () => {
    newPuzzle(state.puzzle.size, state.puzzle.endpoints.length);
  };

  const handleNextLevel = () => {
    // Increase difficulty slightly
    const newSize = Math.min(9, state.puzzle.size + 1);
    const newPaths = Math.min(8, state.puzzle.endpoints.length + 1);
    newPuzzle(newSize, newPaths);
  };

  return (
    <View style={styles.container}>
      <GameHeader onNewPuzzle={handleNewPuzzle} />

      <View style={styles.gridContainer}>
        <Grid />
      </View>

      {/* Win Modal */}
      <Modal visible={isComplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, animatedStyle]}>
            <Text style={styles.winTitle}>Puzzle Complete!</Text>
            <Text style={styles.winSubtitle}>
              You connected all the paths!
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.playAgainButton]}
                onPress={handleNewPuzzle}>
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
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
