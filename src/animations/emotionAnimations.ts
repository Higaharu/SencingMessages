import { AnimationType } from '../types';
import { Animated, Easing } from 'react-native';

interface AnimationConfig {
  duration: number;
  easing?: typeof Easing.linear;
  useNativeDriver: boolean;
}

export const getAnimationByType = (
  type: AnimationType,
  value: Animated.Value,
  intensity: number = 1.0,
  customConfig?: Partial<AnimationConfig>
): Animated.CompositeAnimation => {
  const defaultConfig: AnimationConfig = {
    duration: 1000,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: true,
  };

  const config = { ...defaultConfig, ...customConfig };
  const scaledDuration = Math.floor(config.duration * (0.5 + intensity * 0.5));

  switch (type) {
    case AnimationType.PULSE:
      return Animated.sequence([
        Animated.timing(value, {
          toValue: 1.1 * intensity,
          duration: scaledDuration / 2,
          easing: config.easing,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: scaledDuration / 2,
          easing: config.easing,
          useNativeDriver: config.useNativeDriver,
        }),
      ]);

    case AnimationType.WAVE:
      return Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: scaledDuration / 4,
          easing: Easing.sin,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: 1.05 * intensity,
          duration: scaledDuration / 4,
          easing: Easing.sin,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: 0.95,
          duration: scaledDuration / 4,
          easing: Easing.sin,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: scaledDuration / 4,
          easing: Easing.sin,
          useNativeDriver: config.useNativeDriver,
        }),
      ]);

    case AnimationType.BOUNCE:
      return Animated.sequence([
        Animated.timing(value, {
          toValue: 0.8,
          duration: scaledDuration / 4,
          easing: Easing.bounce,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: 1.2 * intensity,
          duration: scaledDuration / 2,
          easing: Easing.bounce,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: scaledDuration / 4,
          easing: Easing.bounce,
          useNativeDriver: config.useNativeDriver,
        }),
      ]);

    case AnimationType.EXPAND:
      return Animated.timing(value, {
        toValue: 1.2 * intensity,
        duration: scaledDuration,
        easing: Easing.elastic(1),
        useNativeDriver: config.useNativeDriver,
      });

    case AnimationType.FADE:
      return Animated.sequence([
        Animated.timing(value, {
          toValue: 0.6,
          duration: scaledDuration / 2,
          easing: config.easing,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: scaledDuration / 2,
          easing: config.easing,
          useNativeDriver: config.useNativeDriver,
        }),
      ]);

    case AnimationType.ROTATE:
      return Animated.timing(value, {
        toValue: 1,
        duration: scaledDuration,
        easing: config.easing,
        useNativeDriver: config.useNativeDriver,
      });

    case AnimationType.SHAKE:
      return Animated.sequence([
        Animated.timing(value, {
          toValue: -3 * intensity,
          duration: scaledDuration / 6,
          easing: Easing.bounce,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: 3 * intensity,
          duration: scaledDuration / 6,
          easing: Easing.bounce,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: -2 * intensity,
          duration: scaledDuration / 6,
          easing: Easing.bounce,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: 2 * intensity,
          duration: scaledDuration / 6,
          easing: Easing.bounce,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: -1 * intensity,
          duration: scaledDuration / 6,
          easing: Easing.bounce,
          useNativeDriver: config.useNativeDriver,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: scaledDuration / 6,
          easing: Easing.bounce,
          useNativeDriver: config.useNativeDriver,
        }),
      ]);

    default:
      return Animated.timing(value, {
        toValue: 1,
        duration: scaledDuration,
        easing: config.easing,
        useNativeDriver: config.useNativeDriver,
      });
  }
};

export const getAnimationStyle = (
  type: AnimationType,
  animatedValue: Animated.Value
): Record<string, any> => {
  switch (type) {
    case AnimationType.PULSE:
    case AnimationType.EXPAND:
    case AnimationType.BOUNCE:
      return {
        transform: [{ scale: animatedValue }],
      };

    case AnimationType.WAVE:
      return {
        transform: [{ scaleY: animatedValue }],
      };

    case AnimationType.FADE:
      return {
        opacity: animatedValue,
      };

    case AnimationType.ROTATE:
      return {
        transform: [
          {
            rotate: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      };

    case AnimationType.SHAKE:
      return {
        transform: [
          {
            translateX: animatedValue,
          },
        ],
      };

    default:
      return {
        transform: [{ scale: animatedValue }],
      };
  }
}; 