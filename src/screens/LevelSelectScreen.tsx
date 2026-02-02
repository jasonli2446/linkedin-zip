import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useGame} from '../context/GameContext';
import {COLORS} from '../utils/colors';
import {DIFFICULTIES, DifficultyConfig} from '../game/types';

interface LevelSelectScreenProps {
  onLevelSelect: () => void;
}

export function LevelSelectScreen({
  onLevelSelect,
}: LevelSelectScreenProps): React.JSX.Element {
  const {newPuzzle} = useGame();

  const handleDifficultySelect = (config: DifficultyConfig) => {
    newPuzzle(config.gridSize, config.numCheckpoints);
    onLevelSelect();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LinkedIn Zip</Text>
      <Text style={styles.subtitle}>Select Difficulty</Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {DIFFICULTIES.map(config => (
          <TouchableOpacity
            key={config.name}
            style={styles.levelCard}
            onPress={() => handleDifficultySelect(config)}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelName}>{config.name}</Text>
              <Text style={styles.levelDetails}>
                {config.gridSize}x{config.gridSize} grid, {config.numCheckpoints}{' '}
                checkpoints
              </Text>
            </View>
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>Play</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  levelCard: {
    backgroundColor: COLORS.gridBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  levelDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  playButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  playButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
