import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions, Platform, Linking, TouchableOpacity } from 'react-native';
import { Message } from '../types';
import { EmotionBubble } from './EmotionBubble';
import * as Haptics from 'expo-haptics';

interface EmotionMessageProps {
  message: Message;
  isUser: boolean;
  onAnimationComplete?: () => void;
}

export const EmotionMessage: React.FC<EmotionMessageProps> = ({
  message,
  isUser,
  onAnimationComplete,
}) => {
  const { width } = useWindowDimensions();
  const translateX = React.useRef(new Animated.Value(isUser ? width : -width)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Trigger haptic feedback when a new message appears
    triggerHapticFeedback();

    // Animate message appearance
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, [message.id]);

  const triggerHapticFeedback = () => {
    if (!isUser) {
      // Only trigger haptic for receiving messages
      switch (message.emotion.vibrationPattern) {
        case 'intense':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'quick':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'long':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'rhythmic':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }, 150);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // URLを検出し、リンクに変換する関数
  const detectAndLinkifyUrls = (text: string) => {
    if (!text) return [];
    
    // URLを検出する正規表現
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    // 検出したURLをリンクに変換
    const elements = parts.map((part, index) => {
      // URLパターンにマッチする場合
      if (urlRegex.test(part)) {
        const url = part;
        const handlePress = () => {
          Linking.openURL(url).catch(err => 
            console.error('URLを開けませんでした:', err)
          );
        };
        
        if (Platform.OS === 'web') {
          return (
            <a 
              key={index} 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#0066cc',
                textDecoration: 'underline',
                wordBreak: 'break-all'
              }}
            >
              {url}
            </a>
          );
        } else {
          return (
            <Text
              key={index}
              style={styles.linkText}
              onPress={handlePress}
            >
              {url}
            </Text>
          );
        }
      } 
      // 通常のテキストの場合
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
    
    return elements;
  };

  const containerStyle = isUser
    ? [styles.container, styles.userContainer]
    : [styles.container, styles.otherContainer];

  // 異なるプラットフォームに応じてコンテナの幅を設定
  const getTextContainerStyle = () => {
    // 基本スタイル
    const baseStyle = [
      styles.textContainer, 
      { backgroundColor: message.emotion.color + '40' }
    ];
    
    // プラットフォーム固有のスタイルを追加
    if (Platform.OS === 'web') {
      return [...baseStyle, styles.webTextContainer];
    } else if (Platform.OS === 'ios') {
      return [...baseStyle, styles.iosTextContainer];
    } else {
      return [...baseStyle, styles.androidTextContainer];
    }
  };

  // テキストのレンダリングスタイル
  const getTextStyle = () => {
    if (Platform.OS === 'web') {
      return { ...styles.messageText, ...styles.webMessageText };
    } else if (Platform.OS === 'ios') {
      return { ...styles.messageText, ...styles.iosMessageText };
    } else {
      return { ...styles.messageText, ...styles.androidMessageText };
    }
  };

  // テキストコンテンツを処理
  const processedContent = message.textContent ? 
    detectAndLinkifyUrls(message.textContent) : null;

  // 感情オブジェクトのディープコピーを作成して独立させる
  const clonedEmotion = React.useMemo(() => {
    return { ...message.emotion };
  }, [message.id, message.emotion.id, message.emotion.intensity]);

  return (
    <Animated.View
      style={[
        styles.messageWrapper,
        isUser ? styles.userMessageWrapper : styles.otherMessageWrapper,
        { opacity, transform: [{ translateX }] },
      ]}
    >
      <View style={containerStyle}>
        <EmotionBubble
          emotion={clonedEmotion}
          size={60}
          autoAnimate={true}
          animationDuration={3000}
          useEmoji={true}
        />
        
        {message.textContent && (
          <View style={getTextContainerStyle()}>
            {Platform.OS === 'web' ? (
              <pre style={{
                fontSize: 16,
                lineHeight: 1.5,
                color: '#000000',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                margin: 0,
              }}>
                {processedContent}
              </pre>
            ) : (
              <Text style={getTextStyle()}>{processedContent}</Text>
            )}
          </View>
        )}
      </View>
      
      <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.otherTimestamp]}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  container: {
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userContainer: {
    borderTopRightRadius: 4,
    flexDirection: 'row-reverse',
  },
  otherContainer: {
    borderTopLeftRadius: 4,
  },
  // ベースとなるテキストコンテナスタイル
  textContainer: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
  },
  // Web向けのテキストコンテナ調整
  webTextContainer: {
    maxWidth: 280,
  },
  // iOS向けのテキストコンテナ調整
  iosTextContainer: {
    maxWidth: 220,
  },
  // Android向けのテキストコンテナ調整
  androidTextContainer: {
    maxWidth: 240,
  },
  // ベースとなるテキストスタイル
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  // Web向けのテキスト調整
  webMessageText: {
    lineHeight: 22,
  },
  // iOS向けのテキスト調整
  iosMessageText: {
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  // Android向けのテキスト調整
  androidMessageText: {
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  // リンクスタイル
  linkText: {
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
  timestamp: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  userTimestamp: {
    alignSelf: 'flex-end',
  },
  otherTimestamp: {
    alignSelf: 'flex-start',
  },
}); 