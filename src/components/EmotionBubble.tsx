import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  ViewStyle,
  Platform,
  Pressable,
} from 'react-native';
import { Emotion, AnimationType, VibrationPattern } from '../types';
import { getAnimationByType, getAnimationStyle } from '../animations/emotionAnimations';
import * as Haptics from 'expo-haptics';

interface EmotionBubbleProps {
  emotion: Emotion;
  size?: number;
  style?: ViewStyle;
  withText?: boolean;
  onPress?: () => void;
  autoAnimate?: boolean;
  animationDuration?: number;
  useEmoji?: boolean;
}

export const EmotionBubble: React.FC<EmotionBubbleProps> = ({
  emotion,
  size = 80,
  style,
  withText = false,
  onPress,
  autoAnimate = true,
  animationDuration = 2000,
  useEmoji = true,
}) => {
  // Store emotion as a ref that we'll update when the props change
  const fixedEmotionRef = useRef<Emotion>({...emotion});
  
  // Update the ref when emotion props change
  useEffect(() => {
    // Update the ref with the latest emotion data
    fixedEmotionRef.current = {...emotion};

    // Log emotion updates for debugging
    console.log(
      `EmotionBubble UPDATED: emotion=${emotion.name}, ` +
      `emoji=${emotion.emoji}, intensity=${emotion.intensity}, ` +
      `animation=${emotion.animationType}`
    );
    
    // If auto-animate is on, restart the animation with new intensity
    if (autoAnimate) {
      startAnimation();
    }
  }, [emotion, emotion.intensity, emotion.animationType, autoAnimate]); // Include dependencies that should trigger updates
  
  const animatedValue = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // アニメーション開始関数
  const startAnimation = useCallback(() => {
    // 現在のアニメーションを停止
    if (animationRef.current) {
      animationRef.current.stop();
    }

    try {
      // 現在の感情プロパティを使用 (最新の強度を反映)
      const currentIntensity = fixedEmotionRef.current.intensity;
      const currentAnimationType = fixedEmotionRef.current.animationType;

      console.log(`Starting animation with intensity: ${currentIntensity}`);

      // アニメーションの生成
      animationRef.current = getAnimationByType(
        currentAnimationType,
        animatedValue,
        currentIntensity,
        { duration: animationDuration }
      );

      // アニメーションの開始
      Animated.loop(animationRef.current).start();
    } catch (error) {
      console.error('Animation error:', error);
    }
  }, [animationDuration, animatedValue, emotion]);

  // アニメーション設定の副作用
  useEffect(() => {
    if (autoAnimate) {
      startAnimation();
    }

    return () => {
      // クリーンアップ: アニメーション停止
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [autoAnimate, startAnimation]);

  const handlePress = () => {
    if (onPress) {
      // 固定された振動パターンを使用
      triggerHapticFeedback(fixedEmotionRef.current.vibrationPattern);
      
      // 視覚的フィードバック
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      onPress();
    }
  };

  const triggerHapticFeedback = (pattern: VibrationPattern) => {
    if (Platform.OS === 'web') {
      return; // Skip haptics on web
    }
    
    try {
      switch (pattern) {
        case VibrationPattern.QUICK:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case VibrationPattern.LONG:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case VibrationPattern.GENTLE:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case VibrationPattern.INTENSE:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case VibrationPattern.RHYTHMIC:
          // For rhythmic, we can chain multiple haptic feedbacks with slight delays
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() => {
            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }, 150);
          });
          break;
        case VibrationPattern.NONE:
        default:
          // No haptic feedback
          break;
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  const animationStyle = getAnimationStyle(fixedEmotionRef.current.animationType, animatedValue);

  const bubbleSize = size;
  const touchableSize = Math.max(size, 60); // タッチ領域を最低60pxに設定
  const emojiSize = Math.max(Math.round(size * 0.8), 40); // 絵文字のサイズをバブルサイズの80%に設定

  // 強度に応じたスタイルの適用
  const applyIntensityStyles = (baseStyle: any) => {
    const intensity = fixedEmotionRef.current.intensity;
    const opacity = 0.7 + (intensity * 0.3); // 70%〜100%の透明度（絵文字は薄くしすぎない）
    const borderWidth = Math.max(1, Math.round(intensity * 4)); // 1px〜4pxのボーダー
    const shadowOpacity = intensity * 0.8; // 0〜0.8のシャドウ
    const shadowSize = Math.round(intensity * 10); // 0〜10pxのシャドウサイズ
    
    return {
      ...baseStyle,
      opacity,
      borderWidth: borderWidth,
      shadowColor: fixedEmotionRef.current.secondaryColor || '#000',
      shadowOpacity,
      shadowRadius: shadowSize,
      shadowOffset: { width: 0, height: Math.round(shadowSize / 2) },
      elevation: Math.round(shadowSize),
    };
  };

  const bubbleStyle = {
    width: bubbleSize,
    height: bubbleSize,
    borderRadius: bubbleSize / 2,
    backgroundColor: useEmoji ? 'transparent' : fixedEmotionRef.current.color,
    borderWidth: useEmoji ? 0 : 3,
    borderColor: useEmoji ? 'transparent' : (fixedEmotionRef.current.secondaryColor || fixedEmotionRef.current.color),
  };

  // 強度に応じたバブルスタイルを適用
  const intensifiedBubbleStyle = applyIntensityStyles(bubbleStyle);

  // Webブラウザ用のコンポーネント
  if (Platform.OS === 'web') {
    // Web環境での強度反映
    const intensity = fixedEmotionRef.current.intensity;
    const getWebIntensityStyle = () => {
      // 強度に基づく効果
      const opacity = 0.7 + (intensity * 0.3); // 70%〜100%の透明度（絵文字は薄くしすぎない）
      
      return {
        opacity: opacity,
        borderWidth: useEmoji ? 0 : `${Math.max(2, Math.floor(intensity * 5))}px`,
        filter: useEmoji ? undefined : `brightness(${0.7 + (intensity * 0.3)}) saturate(${0.7 + (intensity * 0.3)})`,
        boxShadow: useEmoji ? undefined : `0px ${Math.floor(intensity * 5)}px ${Math.floor(intensity * 10)}px rgba(0, 0, 0, ${intensity * 0.5})`,
      };
    };

    // 強度に基づくアニメーション効果
    const getAnimationStyle = () => {
      const scale = useEmoji ? `scale(${1 + intensity * 0.4})` : `scale(${1 + intensity * 0.2})`;
      const translateY = useEmoji ? `translateY(${-10 * intensity}px)` : `translateY(${-5 * intensity}px)`;
      const rotate = useEmoji ? `rotate(${10 * intensity}deg)` : `rotate(${5 * intensity}deg)`;
      
      const animationStyle = {
        pulse: {
          transform: scale,
        },
        bounce: {
          transform: translateY,
        },
        wave: {
          transform: `translateX(${8 * intensity}px)`,
        },
        shake: {
          transform: rotate,
        },
        rotate: {
          transform: `rotate(${360 * intensity}deg)`,
        },
      };
      
      return animationStyle;
    };

    // 強度に基づくアニメーション速度
    const getAnimationDuration = () => {
      // 強度が高いほど速く
      return `${3 - (intensity * 1)}s`;
    };

    const intensityStyle = getWebIntensityStyle();
    const animationDuration = getAnimationDuration();
    const animStyles = getAnimationStyle();

    // 動的なキーフレームのIDを生成 (強度を含める)
    const keyframeId = `${fixedEmotionRef.current.animationType}-${fixedEmotionRef.current.id}-${Math.round(intensity * 100)}`;

    const getKeyframes = () => {
      const animationType = fixedEmotionRef.current.animationType;
      let keyframeCSS = '';

      // 強度に応じたアニメーションを作成
      switch (animationType) {
        case AnimationType.PULSE:
          keyframeCSS = `
            @keyframes ${keyframeId} {
              0%, 100% { transform: scale(1); }
              50% { transform: ${animStyles.pulse.transform}; }
            }
          `;
          break;
        case AnimationType.BOUNCE:
          keyframeCSS = `
            @keyframes ${keyframeId} {
              0%, 100% { transform: translateY(0); }
              50% { transform: ${animStyles.bounce.transform}; }
            }
          `;
          break;
        case AnimationType.WAVE:
          keyframeCSS = `
            @keyframes ${keyframeId} {
              0%, 100% { transform: translateX(0); }
              50% { transform: ${animStyles.wave.transform}; }
            }
          `;
          break;
        case AnimationType.SHAKE:
          keyframeCSS = `
            @keyframes ${keyframeId} {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: ${animStyles.shake.transform}; }
            }
          `;
          break;
        case AnimationType.ROTATE:
          keyframeCSS = `
            @keyframes ${keyframeId} {
              0% { transform: rotate(0deg); }
              100% { transform: ${animStyles.rotate.transform}; }
            }
          `;
          break;
        case AnimationType.EXPAND:
          keyframeCSS = `
            @keyframes ${keyframeId} {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(${1 + intensity * 0.3}); }
            }
          `;
          break;
        case AnimationType.FADE:
          keyframeCSS = `
            @keyframes ${keyframeId} {
              0%, 100% { opacity: 1; }
              50% { opacity: ${0.3 + intensity * 0.4}; }
            }
          `;
          break;
        default:
          keyframeCSS = `
            @keyframes ${keyframeId} {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `;
      }
      
      return keyframeCSS;
    };

    // 動的なキーフレームを生成
    if (typeof document !== 'undefined') {
      const styleId = `emotion-style-${fixedEmotionRef.current.id}-${Math.round(intensity * 100)}`;
      let styleEl = document.getElementById(styleId);
      
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      
      styleEl.innerHTML = getKeyframes();
    }

    return (
      <div
        onClick={onPress}
        style={{
          cursor: onPress ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0px',
          padding: '15px',
          minWidth: `${touchableSize}px`,
          minHeight: `${touchableSize}px`,
          position: 'relative',
          zIndex: 10,
          ...(style as any),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {useEmoji && fixedEmotionRef.current.emoji ? (
            <div 
              style={{
                fontSize: `${emojiSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: intensityStyle.opacity,
                animation: autoAnimate ? 
                  `${keyframeId} ${animationDuration} infinite ease-in-out` : 'none',
              }}
            >
              {fixedEmotionRef.current.emoji}
            </div>
          ) : (
            <div 
              style={{
                width: bubbleSize,
                height: bubbleSize,
                borderRadius: '50%',
                backgroundColor: fixedEmotionRef.current.color,
                border: intensityStyle.borderWidth ? `${intensityStyle.borderWidth} solid ${fixedEmotionRef.current.secondaryColor || fixedEmotionRef.current.color}` : undefined,
                boxShadow: intensityStyle.boxShadow,
                opacity: intensityStyle.opacity,
                filter: intensityStyle.filter,
                // アニメーション効果
                animation: autoAnimate ? 
                  `${keyframeId} ${animationDuration} infinite ease-in-out` : 'none',
              }}
            />
          )}
          {withText && (
            <div style={{
              marginTop: 8,
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              opacity: intensityStyle.opacity,
            }}>
              {fixedEmotionRef.current.name}
            </div>
          )}
        </div>
      </div>
    );
  }

  // モバイル用のアニメーション調整
  // 感情の強度に基づいてアニメーションのスケールを決定
  // 例：pulseの場合は強度に応じて拡大率を変える
  const getIntensityBasedAnimationStyle = () => {
    const intensity = fixedEmotionRef.current.intensity;
    const baseScale = 1 + (intensity * 0.4); // 1.0〜1.4倍
    const baseTranslateY = -10 * intensity; // 0〜-10px
    const baseRotate = 10 * intensity; // 0〜10度
    
    const additionalStyle = {};
    
    switch (fixedEmotionRef.current.animationType) {
      case 'pulse':
        Object.assign(additionalStyle, {
          transform: [{scale: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, baseScale]
          })}]
        });
        break;
      case 'bounce':
        Object.assign(additionalStyle, {
          transform: [{translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, baseTranslateY]
          })}]
        });
        break;
      case 'wave':
        Object.assign(additionalStyle, {
          transform: [{translateX: animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 8 * intensity, 0]
          })}]
        });
        break;
      case 'shake':
        Object.assign(additionalStyle, {
          transform: [{rotate: animatedValue.interpolate({
            inputRange: [0, 0.25, 0.5, 0.75, 1],
            outputRange: ['0deg', `${baseRotate}deg`, '0deg', `${-baseRotate}deg`, '0deg']
          })}]
        });
        break;
      case 'rotate':
        Object.assign(additionalStyle, {
          transform: [{rotate: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', `${360 * intensity}deg`]
          })}]
        });
        break;
      case 'expand':
        Object.assign(additionalStyle, {
          transform: [{scale: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1 + 0.3 * intensity]
          })}]
        });
        break;
      case 'fade':
        Object.assign(additionalStyle, {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1 * intensity]
          })
        });
        break;
    }
    
    return additionalStyle;
  };

  // 強度ベースのアニメーションスタイルを取得
  const intensityAnimationStyle = getIntensityBasedAnimationStyle();

  // モバイル用のコンポーネント
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        {
          minWidth: touchableSize,
          minHeight: touchableSize,
          padding: 15, // パディングを追加して、タッチ領域を拡大
        },
        style,
      ]}
      activeOpacity={0.7}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <View style={styles.contentContainer}>
        {useEmoji && fixedEmotionRef.current.emoji ? (
          <Animated.Text
            style={[
              {
                fontSize: emojiSize,
                opacity: 0.7 + (fixedEmotionRef.current.intensity * 0.3), // 70%〜100%の透明度
                textAlign: 'center',
              },
              intensityAnimationStyle, // 強度ベースのアニメーションスタイルを適用
            ]}
          >
            {fixedEmotionRef.current.emoji}
          </Animated.Text>
        ) : (
          <Animated.View
            style={[
              styles.bubble,
              intensifiedBubbleStyle,
              intensityAnimationStyle, // 強度ベースのアニメーションスタイルを適用
            ]}
          />
        )}
        {withText && (
          <Text style={[
            styles.emotionText,
            { opacity: 0.7 + (fixedEmotionRef.current.intensity * 0.3) } // テキストも強度に応じて透明度を変更
          ]}>
            {fixedEmotionRef.current.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    position: 'relative',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emotionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

// Web用のCSSアニメーションの基本設定
if (Platform.OS === 'web') {
  // ページにスタイルを動的に追加
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @keyframes wave {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(5px); }
    }
    @keyframes shake {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(5deg); }
    }
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleEl);
} 