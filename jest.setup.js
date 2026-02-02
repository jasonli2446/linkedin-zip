// Mock native modules for Jest
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    Gesture: {
      Pan: () => ({
        onBegin: () => ({
          onUpdate: () => ({
            onEnd: () => ({
              onFinalize: () => ({}),
            }),
          }),
        }),
      }),
    },
  };
});

jest.mock('react-native-reanimated', () => {
  return {
    default: {
      call: () => {},
    },
    useSharedValue: jest.fn((init) => ({value: init})),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((val) => val),
    withSequence: jest.fn((...args) => args[0]),
    withDelay: jest.fn((_, val) => val),
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    Svg: View,
    Line: View,
    Circle: View,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  return {
    SafeAreaProvider: ({children}) => children,
    SafeAreaConsumer: ({children}) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({x: 0, y: 0, width: 375, height: 812}),
  };
});
