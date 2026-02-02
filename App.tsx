import React, {useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {GameProvider} from './src/context/GameContext';
import {GameScreen} from './src/screens/GameScreen';
import {LevelSelectScreen} from './src/screens/LevelSelectScreen';
import {COLORS} from './src/utils/colors';

function App(): React.JSX.Element {
  const [showLevelSelect, setShowLevelSelect] = useState(true);

  const handleLevelSelect = () => {
    setShowLevelSelect(false);
  };

  const handleBackToMenu = () => {
    setShowLevelSelect(true);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <GameProvider>
          <View style={styles.container}>
            {showLevelSelect ? (
              <LevelSelectScreen onLevelSelect={handleLevelSelect} />
            ) : (
              <GameScreen onBack={handleBackToMenu} />
            )}
          </View>
        </GameProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
